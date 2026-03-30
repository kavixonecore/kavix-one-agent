import type { HttpInterceptorFn } from "@angular/common/http";
import { retry, timer } from "rxjs";

const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: { status?: number }, retryCount: number) => {
        if (error.status && NON_RETRYABLE_STATUSES.has(error.status)) {
          throw error;
        }
        return timer(Math.pow(2, retryCount) * 500);
      },
    }),
  );
};
