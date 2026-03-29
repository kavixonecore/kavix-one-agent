import type { IGenerationPlan, ITraceEntry } from "../core/interfaces/index.mjs";

/**
 * Result of a complete runGeneration invocation.
 */
export interface IRunResult {

  success: boolean;
  plan: IGenerationPlan | null;
  featuresCompleted: string[];
  featuresFailed: string[];
  traces: ITraceEntry[];
  summary: string;
}
