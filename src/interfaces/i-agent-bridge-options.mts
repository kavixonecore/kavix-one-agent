import type { ReviewResponse } from "../generation/engine.mjs";

/**
 * Options for invoking the agent-one core via the agent bridge.
 */
export interface IAgentBridgeOptions {

  projectName: string;
  outputDir: string;
  prompt?: string;
  prdPath?: string;
  /** When true, returns the plan without generating files (useful for testing and previews). */
  dryRun?: boolean;
  onReviewCheckpoint?: (featureName: string, files: string[]) => Promise<ReviewResponse>;
  onProgress?: (message: string) => void;
}
