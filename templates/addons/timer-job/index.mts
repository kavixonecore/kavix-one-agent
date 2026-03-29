import { TemplateType } from "../../../src/core/enums/index.mjs";

import type {
  IFeatureSpec,
  IGeneratedFile,
  IGenerationContext,
  IRenderedFile,
  ITemplate,
  IValidationResult,
} from "../../../src/core/interfaces/index.mjs";

/**
 * Timer Job addon template.
 * Generates a setInterval-based timer job following the ct-ai-photo-qc fetch-instances pattern.
 * Includes: configurable interval, run-on-startup option, graceful shutdown, health check.
 */
export const timerJobTemplate: ITemplate = {

  name: "timer-job",
  type: TemplateType.ADDON,
  description: "Generates a setInterval-based timer job with configurable interval, run-on-startup, graceful shutdown (SIGTERM/SIGINT), health check, and Winston logger",

  plan(feature: IFeatureSpec): IGeneratedFile[] {
    const lowerName = feature.name.toLowerCase()
.replace(/\s+/g, "-");
    return [
      {
        path: `src/jobs/${lowerName}-timer.mts`,
        description: `Timer job for ${feature.name}`,
        templateName: "timer-job",
        featureName: feature.name,
      },
      {
        path: `src/jobs/interfaces/i-${lowerName}-config.mts`,
        description: `Configuration interface for the ${feature.name} timer job`,
        templateName: "timer-job",
        featureName: feature.name,
      },
      {
        path: "src/jobs/index.mts",
        description: "Barrel export for the jobs module",
        templateName: "timer-job",
        featureName: feature.name,
      },
    ];
  },

  render(feature: IFeatureSpec, context: IGenerationContext): IRenderedFile[] {
    const { projectName } = context;
    const lowerName = feature.name.toLowerCase()
.replace(/\s+/g, "-");
    const pascalName = toPascalCase(feature.name);

    return [
      {
        path: `src/jobs/${lowerName}-timer.mts`,
        content: renderTimerJob(lowerName, pascalName, projectName),
        featureName: feature.name,
      },
      {
        path: `src/jobs/interfaces/i-${lowerName}-config.mts`,
        content: renderConfigInterface(lowerName, pascalName),
        featureName: feature.name,
      },
      {
        path: "src/jobs/index.mts",
        content: renderBarrel(lowerName, pascalName),
        featureName: feature.name,
      },
    ];
  },

  validate(files: IRenderedFile[]): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (files.length === 0) {
      errors.push("No files were rendered by the timer-job addon");
      return { valid: false, errors, warnings };
    }

    const hasTimer = files.some((f) => f.path.endsWith("-timer.mts"));
    const hasConfig = files.some((f) => f.path.includes("interfaces/i-") && f.path.endsWith("-config.mts"));
    const hasBarrel = files.some((f) => f.path === "src/jobs/index.mts");

    if (!hasTimer) {
      errors.push("Missing timer file (*-timer.mts)");
    }
    if (!hasConfig) {
      errors.push("Missing config interface file (interfaces/i-*-config.mts)");
    }
    if (!hasBarrel) {
      errors.push("Missing barrel export (src/jobs/index.mts)");
    }

    for (const file of files) {
      if (!file.content || file.content.trim() === "") {
        errors.push(`File has empty content: ${file.path}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0)
.toUpperCase() + word.slice(1)
.toLowerCase())
    .join("");
}

function renderTimerJob(lowerName: string, pascalName: string, projectName: string): string {
  const envPrefix = lowerName.toUpperCase()
.replace(/-/g, "_");
  return `import Elysia from "elysia";
import winston from "winston";

import type { I${pascalName}Config } from "./interfaces/i-${lowerName}-config.mjs";

/**
 * ${pascalName} timer job for ${projectName}.
 * Runs a task on a configurable interval with optional run-on-startup.
 * Follows the ct-ai-photo-qc fetch-instances timer pattern.
 *
 * Environment variables:
 *   ${envPrefix}_INTERVAL_MS — Interval in milliseconds (default: 60000)
 *   ${envPrefix}_RUN_ON_STARTUP — Run task immediately on start (default: true)
 */
export class ${pascalName}Timer {

  readonly #config: I${pascalName}Config;

  readonly #logger: winston.Logger;

  #isRunning = false;

  #intervalHandle: ReturnType<typeof setInterval> | undefined;

  public constructor(config: I${pascalName}Config, logger: winston.Logger) {
    this.#config = config;
    this.#logger = logger;
  }

  public start(): void {
    if (this.#isRunning) {
      this.#logger.warn("${pascalName}Timer is already running");
      return;
    }

    this.#isRunning = true;
    this.#logger.info("Starting ${pascalName}Timer", {
      intervalMs: this.#config.intervalMs,
      runOnStartup: this.#config.runOnStartup,
    });

    if (this.#config.runOnStartup) {
      this.#run().catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.#logger.error("${pascalName}Timer startup run failed", { error: message });
      });
    }

    this.#intervalHandle = setInterval(() => {
      this.#run().catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.#logger.error("${pascalName}Timer tick error", { error: message });
      });
    }, this.#config.intervalMs);

    process.on("SIGTERM", () => this.stop());
    process.on("SIGINT", () => this.stop());
  }

  public stop(): void {
    if (!this.#isRunning) return;

    this.#isRunning = false;
    if (this.#intervalHandle !== undefined) {
      clearInterval(this.#intervalHandle);
      this.#intervalHandle = undefined;
    }

    this.#logger.info("${pascalName}Timer stopped gracefully");
  }

  public isRunning(): boolean {
    return this.#isRunning;
  }

  async #run(): Promise<void> {
    const startedAt = Date.now();
    this.#logger.info("${pascalName}Timer tick started");

    try {
      await this.#execute();
      const durationMs = Date.now() - startedAt;
      this.#logger.info("${pascalName}Timer tick completed", { durationMs });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.#logger.error("${pascalName}Timer tick failed", { error: message });
      throw err;
    }
  }

  /**
   * Override or replace this method with the actual job logic for ${projectName}.
   */
  async #execute(): Promise<void> {
    this.#logger.info("${pascalName}Timer: executing job");
    // TODO: implement the timer job logic for ${projectName}
  }
}

// ---------------------------------------------------------------------------
// Health check Elysia plugin
// ---------------------------------------------------------------------------
export function create${pascalName}HealthPlugin(timer: ${pascalName}Timer): Elysia {
  return new Elysia({ prefix: "/health/${lowerName}-timer" }).get("/", () => ({
    status: timer.isRunning() ? "running" : "stopped",
    timer: "${lowerName}",
    timestamp: new Date().toISOString(),
  }));
}
`;
}

function renderConfigInterface(lowerName: string, pascalName: string): string {
  return `/**
 * Configuration for the ${pascalName} timer job.
 */
export interface I${pascalName}Config {

  /** Interval between job runs in milliseconds (e.g. 60000 for 1 minute) */
  intervalMs: number;

  /** If true, the job runs immediately when start() is called (default: true) */
  runOnStartup: boolean;
}
`;
}

function renderBarrel(lowerName: string, pascalName: string): string {
  return `export { ${pascalName}Timer, create${pascalName}HealthPlugin } from "./${lowerName}-timer.mjs";
export type { I${pascalName}Config } from "./interfaces/i-${lowerName}-config.mjs";
`;
}
