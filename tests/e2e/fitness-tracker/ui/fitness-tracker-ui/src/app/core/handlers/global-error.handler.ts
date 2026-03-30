import { ErrorHandler, Injectable, inject } from "@angular/core";
import { LoggerService } from "../services/logger.service";
import { NotificationService } from "../services/notification.service";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  private readonly logger = inject(LoggerService);
  private readonly notification = inject(NotificationService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    this.logger.error("Unhandled error", { message, error });
    this.notification.error(message);
  }
}
