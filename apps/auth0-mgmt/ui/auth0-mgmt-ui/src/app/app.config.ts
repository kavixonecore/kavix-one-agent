import type { ApplicationConfig } from "@angular/core";
import {
  provideZonelessChangeDetection,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { routes } from "./app.routes";
import { retryInterceptor } from "./core/interceptors/retry.interceptor";
import { errorInterceptor } from "./core/interceptors/error.interceptor";
import { GlobalErrorHandler } from "./core/handlers/global-error.handler";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([retryInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
