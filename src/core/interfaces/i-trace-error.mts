/**
 * Immutable audit record of an error encountered during a generation step.
 */
export interface ITraceError {

  readonly message: string;
  readonly stack?: string;
  readonly file?: string;
  readonly line?: number;
  readonly context: Record<string, unknown>;
}
