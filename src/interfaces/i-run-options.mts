import type { ReviewResponse } from "../generation/engine.mjs";

/**
 * Options passed to the shared runGeneration function used by both CLI and agent bridge.
 */
export interface IRunOptions {

  projectName: string;
  outputDir: string;
  prompt?: string;
  prdPath?: string;
  prdContent?: string;
  interactive?: boolean;
  dryRun?: boolean;
  askQuestion?: (question: string) => Promise<string>;
  onReviewCheckpoint?: (featureName: string, files: string[]) => Promise<ReviewResponse>;
  onProgress?: (message: string) => void;
  skipSmoke?: boolean;
}
