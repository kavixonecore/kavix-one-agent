import type { IToolUse, ITraceError } from "../../core/interfaces/index.mjs";

/**
 * Mutable working state accumulated during a single trace step.
 * Converted to an immutable ITraceEntry when the step completes.
 */
export interface ITraceContext {

  traceId: string;
  sessionId: string;
  featureName: string;
  stepName: string;
  iteration: number;
  startedAt: string;
  toolUses: Map<string, IToolUse>;
  errors: ITraceError[];
  tokenPrompt: number;
  tokenCompletion: number;
}
