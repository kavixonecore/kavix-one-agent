export class AppError extends Error {

  public readonly statusCode: number;

  public readonly code: string;

  public constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
