/**
 * Immutable audit record of a single tool invocation during generation.
 */
export interface IToolUse {

  readonly toolName: string;
  readonly callCount: number;
  readonly totalDurationMs: number;
}
