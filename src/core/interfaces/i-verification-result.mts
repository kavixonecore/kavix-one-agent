/**
 * Result from a verification gate (lint, test, or smoke).
 */
export interface IVerificationResult {

  passed: boolean;
  gate: string;
  errors: string[];
  warnings: string[];
  durationMs: number;
  output?: string;
}
