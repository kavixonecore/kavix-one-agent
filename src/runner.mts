import { createLogger } from "./logger/logger.mjs";
import { parsePrompt } from "./input/prompt-parser.mjs";
import { parsePrd } from "./input/prd-parser.mjs";
import { interviewForPrd } from "./input/prd-interviewer.mjs";
import { createPlan } from "./planning/generation-planner.mjs";
import { GenerationEngine, type ReviewResponse } from "./generation/engine.mjs";
import { generateSummary } from "./trace/summary-reporter.mjs";

import type { Env } from "./config/env.mjs";
import type { IRunOptions } from "./interfaces/i-run-options.mjs";
import type { IRunResult } from "./interfaces/i-run-result.mjs";
import type { IGenerationPlan, IRenderedFile } from "./core/interfaces/index.mjs";

const logger = createLogger("runner");

async function getEnv(): Promise<Env> {
  const { env } = await import("./config/env.mjs");
  return env;
}

/**
 * Orchestrates the full generation flow shared by both the CLI and agent bridge.
 * Parses input (prompt / PRD / interactive), creates a plan, and runs the generation engine.
 *
 * @param options - Run configuration including input source, I/O callbacks, and flags.
 */
export async function runGeneration(options: IRunOptions): Promise<IRunResult> {
  const {
    projectName,
    outputDir,
    prompt,
    prdPath,
    prdContent: prdContentArg,
    interactive,
    dryRun = false,
    askQuestion,
    onReviewCheckpoint,
    onProgress,
    skipSmoke,
  } = options;

  const emitProgress = (msg: string): void => {
    logger.info(msg);
    onProgress?.(msg);
  };

  let plan: IGenerationPlan | null = null;

  try {
    // --- Step 1: Parse input into feature specs ---
    let prdContent = prdContentArg;

    if (interactive) {
      if (!askQuestion) {
        return makeError(plan, "interactive mode requires askQuestion callback");
      }
      emitProgress("Starting interactive PRD interview...");
      const cfg = await getEnv();
      prdContent = await interviewForPrd(askQuestion, cfg.ANTHROPIC_API_KEY);
    } else if (prdPath) {
      const file = Bun.file(prdPath);
      const exists = await file.exists();
      if (!exists) {
        return makeError(plan, `PRD file not found: ${prdPath}`);
      }
      prdContent = await file.text();
    }

    let features;

    if (prdContent) {
      emitProgress("Parsing PRD into feature specs...");
      features = parsePrd(prdContent);
    } else if (prompt) {
      emitProgress("Parsing prompt with Claude...");
      const cfg = await getEnv();
      const parseResult = await parsePrompt(prompt, cfg.ANTHROPIC_API_KEY);
      features = parseResult.features;
      emitProgress(`Prompt parsed. Tokens: ${parseResult.tokenUsage.totalTokens} (prompt: ${parseResult.tokenUsage.promptTokens}, completion: ${parseResult.tokenUsage.completionTokens})`);
    } else {
      return makeError(plan, "No input provided. Supply --prompt, --prd, or --interactive");
    }

    if (features.length === 0) {
      return makeError(plan, "No features could be parsed from the input");
    }

    // --- Step 2: Create plan ---
    emitProgress(`Creating generation plan for ${projectName} (${features.length} features)...`);
    plan = createPlan(features, projectName);

    if (dryRun) {
      emitProgress("Dry-run mode: plan created, no files will be written.");
      return {
        success: true,
        plan,
        featuresCompleted: [],
        featuresFailed: [],
        traces: [],
        summary: "",
      };
    }

    // --- Step 3: Run generation engine ---
    emitProgress("Starting generation engine...");

    const engineLogger = createLogger("engine");
    const engine = new GenerationEngine(engineLogger);

    const reviewCallback = onReviewCheckpoint
      ? async (featureName: string, renderedFiles: IRenderedFile[]): Promise<ReviewResponse> => {
          const filePaths = renderedFiles.map((f) => f.path);
          return onReviewCheckpoint(featureName, filePaths);
        }
      : undefined;

    const result = await engine.generate(
      plan,
      outputDir,
      false,
      reviewCallback,
      { skipSmoke: skipSmoke ?? true }
    );

    // --- Step 4: Generate summary ---
    const summary = generateSummary(result.traceEntries);

    const featuresCompleted = result.featureResults
      .filter((r) => r.errors.length === 0)
      .map((r) => r.featureName);

    const featuresFailed = result.featureResults
      .filter((r) => r.errors.length > 0)
      .map((r) => r.featureName);

    emitProgress(`Generation complete. ${featuresCompleted.length} features completed, ${featuresFailed.length} failed.`);

    return {
      success: result.success,
      plan,
      featuresCompleted,
      featuresFailed,
      traces: result.traceEntries,
      summary,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Runner encountered unexpected error", { error: message });
    return makeError(plan, message);
  }
}

function makeError(plan: IGenerationPlan | null, message: string): IRunResult {
  logger.error("Run failed", { message });
  return {
    success: false,
    plan,
    featuresCompleted: [],
    featuresFailed: [],
    traces: [],
    summary: message,
  };
}
