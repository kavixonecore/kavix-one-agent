import { inject } from "@angular/core";
import type { HttpInterceptorFn } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { LoggerService } from "../services/logger.service";
import { NotificationService } from "../services/notification.service";

let lastAuthRedirect = 0;
const AUTH_REDIRECT_COOLDOWN_MS = 3000;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const notification = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      const status = error.status as number;
      const message = extractMessage(error, status);

      logger.error(`HTTP ${status} - ${req.method} ${req.url}`, error);

      if (status === 401) {
        handleUnauthorized(notification, router);
      } else {
        notification.error(message);
      }

      return throwError(() => error);
    }),
  );
};

function handleUnauthorized(notification: NotificationService, router: Router): void {
  const now = Date.now();
  if (now - lastAuthRedirect < AUTH_REDIRECT_COOLDOWN_MS) {
    return;
  }
  lastAuthRedirect = now;
  notification.warn("Please log in to continue");
  router.navigate(["/auth/login"]);
}

function extractMessage(error: unknown, status: number): string {
  if (status === 0) {
    return "Unable to connect to the server";
  }
  if (status === 401) {
    return "Authentication required";
  }
  if (status === 403) {
    return "Access denied";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment.";
  }

  const body = (error as { error?: { error?: string } }).error;
  if (body?.error) {
    return body.error;
  }

  return `Request failed (${status})`;
}
