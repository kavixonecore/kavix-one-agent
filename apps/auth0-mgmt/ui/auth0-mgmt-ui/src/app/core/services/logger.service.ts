import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class LoggerService {

  info(message: string, ...args: unknown[]): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args);
  }
}
