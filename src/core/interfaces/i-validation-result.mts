/**
 * Result from template validation before writing files to disk.
 */
export interface IValidationResult {

  valid: boolean;
  errors: string[];
  warnings: string[];
}
