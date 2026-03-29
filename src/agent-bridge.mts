import { createLogger } from "./logger/logger.mjs";
import { runGeneration } from "./runner.mjs";

import type { IAgentBridgeOptions } from "./interfaces/i-agent-bridge-options.mjs";
import type { IAgentBridgeResult } from "./interfaces/i-agent-bridge-result.mjs";
import type { ReviewResponse } from "./generation/engine.mjs";

export type { IAgentBridgeOptions } from "./interfaces/i-agent-bridge-options.mjs";
export type { IAgentBridgeResult } from "./interfaces/i-agent-bridge-result.mjs";

const logger = createLogger("agent-bridge");

/**
 * Entry point for the Claude Code custom agent integration.
 * Accepts options from the agent invocation context and delegates to the shared runner.
 * Human review checkpoints are surfaced via the onReviewCheckpoint callback
 * rather than terminal prompts, allowing the conversation to flow naturally.
 *
 * @param options - Agent invocation options including prompt/PRD, project name, and callbacks.
 */
export async function runAgentOne(options: IAgentBridgeOptions): Promise<IAgentBridgeResult> {
  logger.info("Agent bridge invoked", {
    projectName: options.projectName,
    hasPrompt: !!options.prompt,
    hasPrdPath: !!options.prdPath,
  });

  const reviewCallback = options.onReviewCheckpoint
    ? async (featureName: string, files: string[]): Promise<ReviewResponse> => {
        return options.onReviewCheckpoint!(featureName, files);
      }
    : undefined;

  const result = await runGeneration({
    projectName: options.projectName,
    outputDir: options.outputDir,
    prompt: options.prompt,
    prdPath: options.prdPath,
    dryRun: options.dryRun,
    onReviewCheckpoint: reviewCallback,
    onProgress: options.onProgress,
    skipSmoke: true,
  });

  logger.info("Agent bridge run complete", {
    success: result.success,
    featuresCompleted: result.featuresCompleted.length,
    featuresFailed: result.featuresFailed.length,
  });

  return {
    success: result.success,
    featuresCompleted: result.featuresCompleted,
    featuresFailed: result.featuresFailed,
    traceSummary: result.summary,
    outputDir: options.outputDir,
  };
}
