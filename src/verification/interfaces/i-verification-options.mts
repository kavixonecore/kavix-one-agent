/**
 * Options for controlling the verification pipeline behavior.
 */
export interface IVerificationOptions {

  maxRetries: number;
  skipSmoke?: boolean;
  endpoints?: string[];
}
