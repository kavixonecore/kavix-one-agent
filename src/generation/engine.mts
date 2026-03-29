import {
  ContainerRenderer,
  DockerComposeRenderer,
  EnvRenderer,
  InterfaceRenderer,
  RepositoryFactoryRenderer,
  RepositoryRenderer,
  RouterRenderer,
  SchemaRenderer,
  ServerRenderer,
  ServiceRenderer,
  SwaggerRenderer,
  TestRenderer,
} from "./renderers/index.mjs";
import { renderPackageJson } from "../../templates/base/package-json.tmpl.mjs";
import { renderTsConfig } from "../../templates/base/tsconfig.tmpl.mjs";
import { renderEslintConfig } from "../../templates/base/eslint-config.tmpl.mjs";
import { FileWriter, type IWriteResult } from "../output/file-writer.mjs";
import { runVerificationPipeline } from "../verification/pipeline.mjs";
import { startTrace, endTrace, recordError, writeTraceToFs } from "../trace/index.mjs";
import { commitFeature } from "../git/git-ops.mjs";
import { TemplateRegistry } from "./template-registry.mjs";
import { validateTemplate } from "./template-validator.mjs";

import type {
  IFeatureSpec,
  IGenerationContext,
  IGenerationPlan,
  IRenderedFile,
  ITraceEntry,
} from "../core/interfaces/index.mjs";
import type { IVerificationOptions } from "../verification/interfaces/index.mjs";
import type winston from "winston";

/**
 * Result of a complete generation run.
 */
export interface IGenerationResult {
  success: boolean;
  filesWritten: string[];
  errors: string[];
  featureResults: IFeatureGenerationResult[];
  traceEntries: ITraceEntry[];
}

/**
 * Result of generating a single feature.
 */
export interface IFeatureGenerationResult {
  featureName: string;
  filesWritten: string[];
  errors: string[];
}

/**
 * Response from a human review checkpoint.
 * - "approve" — accept the generated files and proceed
 * - "reject" — re-render the feature (up to MAX_REGEN_ATTEMPTS)
 * - "skip" — skip this feature and move to the next
 */
export type ReviewResponse = "approve" | "reject" | "skip";

/**
 * Callback invoked after each feature is generated.
 * If omitted, all features are auto-approved (CI/test mode).
 */
export type OnReviewCheckpoint = (
  featureName: string,
  renderedFiles: IRenderedFile[]
) => Promise<ReviewResponse>;

/**
 * Orchestrates bottom-up code generation for all features in a plan.
 * Order: interfaces → schema → repository → service → swagger → router → tests
 * Then writes infrastructure and bootstrap files.
 * After all base features, applies any requested addon templates.
 */
export class GenerationEngine {

  readonly #logger: winston.Logger;

  readonly #interfaceRenderer: InterfaceRenderer;

  readonly #schemaRenderer: SchemaRenderer;

  readonly #repositoryRenderer: RepositoryRenderer;

  readonly #serviceRenderer: ServiceRenderer;

  readonly #swaggerRenderer: SwaggerRenderer;

  readonly #routerRenderer: RouterRenderer;

  readonly #testRenderer: TestRenderer;

  readonly #containerRenderer: ContainerRenderer;

  readonly #envRenderer: EnvRenderer;

  readonly #serverRenderer: ServerRenderer;

  readonly #repositoryFactoryRenderer: RepositoryFactoryRenderer;

  readonly #dockerComposeRenderer: DockerComposeRenderer;

  readonly #templateRegistry: TemplateRegistry;

  public constructor(logger: winston.Logger, templateRegistry?: TemplateRegistry) {
    this.#logger = logger;
    this.#interfaceRenderer = new InterfaceRenderer(logger);
    this.#schemaRenderer = new SchemaRenderer(logger);
    this.#repositoryRenderer = new RepositoryRenderer(logger);
    this.#serviceRenderer = new ServiceRenderer(logger);
    this.#swaggerRenderer = new SwaggerRenderer(logger);
    this.#routerRenderer = new RouterRenderer(logger);
    this.#testRenderer = new TestRenderer(logger);
    this.#containerRenderer = new ContainerRenderer(logger);
    this.#envRenderer = new EnvRenderer(logger);
    this.#serverRenderer = new ServerRenderer(logger);
    this.#repositoryFactoryRenderer = new RepositoryFactoryRenderer(logger);
    this.#dockerComposeRenderer = new DockerComposeRenderer(logger);
    this.#templateRegistry = templateRegistry ?? new TemplateRegistry(logger);
  }

  readonly #MAX_REGEN_ATTEMPTS = 3;

  readonly #DEFAULT_VERIFICATION_OPTIONS: IVerificationOptions = {
    maxRetries: 3,
    skipSmoke: true,
    endpoints: ["/health"],
  };

  public async generate(
    plan: IGenerationPlan,
    outputDir: string,
    dryRun = false,
    onReviewCheckpoint?: OnReviewCheckpoint,
    verificationOptions?: Partial<IVerificationOptions>
  ): Promise<IGenerationResult> {
    const writer = new FileWriter(outputDir, this.#logger, dryRun);
    const sessionId = `session-${Date.now()}`;
    const traceEntries: ITraceEntry[] = [];

    const context: IGenerationContext = {
      projectName: plan.projectName,
      projectScope: plan.projectName,
      outputDir,
      features: plan.features,
      dryRun,
    };

    const allFilesWritten: string[] = [];
    const allErrors: string[] = [];
    const featureResults: IFeatureGenerationResult[] = [];

    this.#logger.info("Starting generation", {
      project: plan.projectName,
      features: plan.features.length,
    });

    // 1. Write infrastructure files (package.json, tsconfig, eslint, gitignore, docker)
    const infraFiles = this.#renderInfrastructure(context);
    const infraResults = await writer.writeFiles(infraFiles);
    this.#collectResults(infraResults, allFilesWritten, allErrors);

    // 2. Write env config
    const envFiles = this.#envRenderer.render(context);
    const envResults = await writer.writeFiles(envFiles);
    this.#collectResults(envResults, allFilesWritten, allErrors);

    // 3. Write repository factory + database config
    const factoryFiles = this.#repositoryFactoryRenderer.render(context);
    const factoryResults = await writer.writeFiles(factoryFiles);
    this.#collectResults(factoryResults, allFilesWritten, allErrors);

    // 4. Write server + plugins + logger
    const serverFiles = this.#serverRenderer.render(context);
    const serverResults = await writer.writeFiles(serverFiles);
    this.#collectResults(serverResults, allFilesWritten, allErrors);

    // 5. Generate each feature bottom-up
    const resolvedVerificationOptions: IVerificationOptions = {
      ...this.#DEFAULT_VERIFICATION_OPTIONS,
      ...verificationOptions,
    };

    for (const feature of plan.features) {
      const traceCtx = startTrace(sessionId, feature.name, "generation");

      const result = await this.#generateFeatureWithReview(
        feature,
        context,
        writer,
        onReviewCheckpoint
      );
      featureResults.push(result);
      allFilesWritten.push(...result.filesWritten);
      allErrors.push(...result.errors);

      // Run verification pipeline (skip in dry run mode)
      if (!dryRun) {
        const verificationResult = await runVerificationPipeline(
          outputDir,
          resolvedVerificationOptions
        );

        if (!verificationResult.passed) {
          for (const err of verificationResult.errors) {
            recordError(traceCtx, new Error(err));
          }
          allErrors.push(...verificationResult.errors);
          this.#logger.error("Verification failed for feature", {
            feature: feature.name,
            errors: verificationResult.errors,
          });
        } else {
          // Commit verified feature
          try {
            const hash = await commitFeature(
              outputDir,
              feature.name,
              `feat: add ${feature.name} feature`
            );
            this.#logger.info("Committed verified feature", { feature: feature.name, hash });
          } catch (commitErr: unknown) {
            const message = commitErr instanceof Error ? commitErr.message : String(commitErr);
            this.#logger.warn("Failed to commit feature (git may not be initialized)", {
              feature: feature.name,
              error: message,
            });
          }
        }
      }

      const traceEntry = endTrace(traceCtx, {
        filesGenerated: result.filesWritten,
        filesModified: [],
        linesOfCode: result.filesWritten.length * 20,
        summary: result.errors.length > 0
          ? `Feature ${feature.name} generated with ${result.errors.length} errors`
          : `Feature ${feature.name} generated successfully`,
      });

      traceEntries.push(traceEntry);

      // Write trace to filesystem (non-blocking — ignore failures)
      if (!dryRun) {
        writeTraceToFs(outputDir, traceEntry)
.catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          this.#logger.warn("Failed to write trace file", { error: message });
        });
      }
    }

    // 6. Write IoC container (after all features so all repos/services are known)
    const containerFiles = this.#containerRenderer.render(context);
    const containerResults = await writer.writeFiles(containerFiles);
    this.#collectResults(containerResults, allFilesWritten, allErrors);

    // 7. Apply requested addon templates (after all base features)
    if (plan.addons && plan.addons.length > 0) {
      this.#logger.info("Applying addon templates", { addons: plan.addons });
      const addonErrors = await this.#applyAddons(
        plan.addons,
        plan.features[0] ?? { name: plan.projectName, entityName: plan.projectName, pluralName: `${plan.projectName}s`, collectionName: plan.projectName, fields: [], enums: [], indexes: [] },
        context,
        writer
      );
      allErrors.push(...addonErrors);
    }

    const success = allErrors.length === 0;
    this.#logger.info("Generation complete", {
      success,
      filesWritten: allFilesWritten.length,
      errors: allErrors.length,
    });

    return {
      success,
      filesWritten: allFilesWritten,
      errors: allErrors,
      featureResults,
      traceEntries,
    };
  }

  async #applyAddons(
    addonNames: string[],
    representativeFeature: IFeatureSpec,
    context: IGenerationContext,
    writer: FileWriter
  ): Promise<string[]> {
    const errors: string[] = [];

    for (const addonName of addonNames) {
      const addon = this.#templateRegistry.getAddon(addonName);

      if (!addon) {
        const msg = `Addon template not found: "${addonName}"`;
        this.#logger.error(msg);
        errors.push(msg);
        continue;
      }

      // Validate the addon implements the contract correctly before rendering
      const validationResult = validateTemplate(addon);
      if (!validationResult.valid) {
        const msg = `Addon "${addonName}" failed template validation: ${validationResult.errors.join("; ")}`;
        this.#logger.error(msg, { errors: validationResult.errors });
        errors.push(msg);
        continue;
      }

      if (validationResult.warnings.length > 0) {
        this.#logger.warn("Addon template has warnings", {
          addon: addonName,
          warnings: validationResult.warnings,
        });
      }

      try {
        const rendered = addon.render(representativeFeature, context);

        // Run addon's own validate() before writing
        const renderValidation = addon.validate(rendered);
        if (!renderValidation.valid) {
          const msg = `Addon "${addonName}" render validation failed: ${renderValidation.errors.join("; ")}`;
          this.#logger.error(msg, { errors: renderValidation.errors });
          errors.push(msg);
          continue;
        }

        const writeResults = await writer.writeFiles(rendered);
        const fileErrors: string[] = [];
        this.#collectResults(writeResults, [], fileErrors);
        errors.push(...fileErrors);

        this.#logger.info("Addon applied successfully", {
          addon: addonName,
          filesWritten: rendered.length,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.#logger.error("Addon render threw an error", { addon: addonName, error: message });
        errors.push(`Addon "${addonName}" render error: ${message}`);
      }
    }

    return errors;
  }

  async #generateFeatureWithReview(
    feature: IFeatureSpec,
    context: IGenerationContext,
    writer: FileWriter,
    onReviewCheckpoint?: OnReviewCheckpoint
  ): Promise<IFeatureGenerationResult> {
    let attempt = 0;

    while (attempt < this.#MAX_REGEN_ATTEMPTS) {
      const allRenderedFiles = this.#renderFeatureFiles(feature);
      const result = await this.#writeFeatureFiles(feature, allRenderedFiles, writer);

      if (!onReviewCheckpoint) {
        // Auto-approve in CI/test mode
        this.#logger.debug("Auto-approving feature (no checkpoint callback)", {
          feature: feature.name,
        });
        return result;
      }

      const response = await onReviewCheckpoint(feature.name, allRenderedFiles);

      if (response === "approve") {
        this.#logger.info("Feature approved at review checkpoint", { feature: feature.name });
        return result;
      }

      if (response === "skip") {
        this.#logger.info("Feature skipped at review checkpoint", { feature: feature.name });
        return { featureName: feature.name, filesWritten: [], errors: [] };
      }

      // response === "reject" — re-render
      attempt++;
      this.#logger.warn("Feature rejected at review checkpoint; re-rendering", {
        feature: feature.name,
        attempt,
        maxAttempts: this.#MAX_REGEN_ATTEMPTS,
      });
    }

    this.#logger.error("Feature rejected after max re-render attempts", {
      feature: feature.name,
    });
    return {
      featureName: feature.name,
      filesWritten: [],
      errors: [`Feature "${feature.name}" rejected after ${this.#MAX_REGEN_ATTEMPTS} attempts`],
    };
  }

  #renderFeatureFiles(feature: IFeatureSpec): IRenderedFile[] {
    this.#logger.info("Rendering feature files", { feature: feature.name });

    return [
      ...this.#interfaceRenderer.render(feature),
      ...this.#schemaRenderer.render(feature),
      ...this.#repositoryRenderer.render(feature),
      ...this.#serviceRenderer.render(feature),
      ...this.#swaggerRenderer.render(feature),
      ...this.#routerRenderer.render(feature),
      ...this.#testRenderer.render(feature),
    ];
  }

  async #writeFeatureFiles(
    feature: IFeatureSpec,
    renderedFiles: IRenderedFile[],
    writer: FileWriter
  ): Promise<IFeatureGenerationResult> {
    const filesWritten: string[] = [];
    const errors: string[] = [];

    const results = await writer.writeFiles(renderedFiles);
    this.#collectResults(results, filesWritten, errors);

    return { featureName: feature.name, filesWritten, errors };
  }

  #renderInfrastructure(context: IGenerationContext): IRenderedFile[] {
    const files: IRenderedFile[] = [
      { path: "package.json", content: renderPackageJson(context) },
      { path: "tsconfig.json", content: renderTsConfig(context) },
      { path: "eslint.config.mjs", content: renderEslintConfig(context) },
      ...this.#dockerComposeRenderer.render(context),
    ];
    return files;
  }

  #collectResults(
    results: IWriteResult[],
    filesWritten: string[],
    errors: string[]
  ): void {
    for (const result of results) {
      if (result.written) {
        filesWritten.push(result.path);
      } else if (result.error) {
        errors.push(`${result.path}: ${result.error}`);
      }
    }
  }
}
