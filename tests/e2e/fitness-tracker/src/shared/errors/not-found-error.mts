import { AppError } from "./app-error.mjs";

export class NotFoundError extends AppError {

  public constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
