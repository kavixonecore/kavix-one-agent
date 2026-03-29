import type { IToolUse } from "./i-tool-use.mjs";
import type { ITraceError } from "./i-trace-error.mjs";

/**
 * Immutable audit record for a single generation step.
 * Written to .docs/<step>.md and MongoDB trace collection.
 */
export interface ITraceEntry {

  readonly traceId: string;
  readonly sessionId: string;
  readonly featureName: string;
  readonly stepName: string;
  readonly iteration: number;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly status: "success" | "failed" | "skipped";
  readonly toolUses: IToolUse[];
  readonly tokenConsumption: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
  readonly result: {
    readonly filesGenerated: string[];
    readonly filesModified: string[];
    readonly linesOfCode: number;
    readonly summary: string;
  };
  readonly errors: ITraceError[];
  readonly documentation: string;
}
