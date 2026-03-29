import { AppError } from "./app-error.mjs";

export class ValidationError extends AppError {

  public readonly details: unknown;

  public constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.details = details;
  }
}
