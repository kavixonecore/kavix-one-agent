import { inject } from "@angular/core";
import type { HttpInterceptorFn } from "@angular/common/http";
import { retry, throwError, timer } from "rxjs";
import { LoggerService } from "../services/logger.service";

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const NON_RETRYABLE = new Set([400, 401, 403, 404, 422]);

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        const status = (error as { status?: number }).status ?? 0;
        if (NON_RETRYABLE.has(status)) {
          return throwError(() => error);
        }
        const delay = INITIAL_DELAY_MS * Math.pow(2, retryCount - 1);
        logger.warn(`Retrying (${retryCount}/${MAX_RETRIES}): ${req.url}`, { status, delay });
        return timer(delay);
      },
    }),
  );
};
