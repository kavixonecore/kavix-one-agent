import { ApplicationConfig, ErrorHandler, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideAuth0, authHttpInterceptorFn } from "@auth0/auth0-angular";
import { routes } from "./app.routes";
import { GlobalErrorHandler } from "./core/handlers/global-error.handler";
import { retryInterceptor } from "./core/interceptors/retry.interceptor";
import { errorInterceptor } from "./core/interceptors/error.interceptor";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authHttpInterceptorFn, retryInterceptor, errorInterceptor]),
    ),
    provideAnimationsAsync(),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
        audience: environment.auth0.audience,
        organization: environment.auth0.organizationId,
      },
      httpInterceptor: {
        allowedList: ["/api/*"],
      },
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
