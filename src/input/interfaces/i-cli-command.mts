/**
 * Parsed CLI command and its associated arguments.
 */
export interface ICliCommand {

  command: "generate" | "resume" | "status" | "trace";
  projectName?: string;
  prompt?: string;
  prdPath?: string;
  interactive?: boolean;
  /** Outputs generation plan without writing files */
  dryRun?: boolean;
  /** trace command: filter by session ID */
  sessionId?: string;
  /** trace command: query MongoDB instead of local .docs/ */
  useMongo?: boolean;
}
