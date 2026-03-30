import type { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { LoggerService } from "../services/logger.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error) => {
      logger.error(`HTTP ${req.method} ${req.url} failed`, error);
      return throwError(() => error);
    }),
  );
};
