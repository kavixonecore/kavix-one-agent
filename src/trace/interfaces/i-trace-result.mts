/**
 * Result data provided when ending a trace step.
 */
export interface ITraceResult {

  filesGenerated: string[];
  filesModified: string[];
  linesOfCode: number;
  summary: string;
}
