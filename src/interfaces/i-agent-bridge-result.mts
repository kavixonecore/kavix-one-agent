/**
 * Result of an agent bridge invocation.
 */
export interface IAgentBridgeResult {

  success: boolean;
  featuresCompleted: string[];
  featuresFailed: string[];
  traceSummary: string;
  outputDir: string;
}
