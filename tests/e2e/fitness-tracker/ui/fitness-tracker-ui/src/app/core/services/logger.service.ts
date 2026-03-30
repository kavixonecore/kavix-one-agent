import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { StorageService } from "./storage.service";
import { STORAGE_KEYS } from "../constants/storage-keys";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly data?: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

@Injectable({ providedIn: "root" })
export class LoggerService {

  private readonly storage = inject(StorageService);
  private readonly minLevel: LogLevel = environment.logLevel as LogLevel;

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
    this.persistError(message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data !== undefined ? { data } : {}),
    };
    this.writeToConsole(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private writeToConsole(entry: LogEntry): void {
    const msg = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    switch (entry.level) {
      case "debug":
      case "info":
        break;
      case "warn":
        console.warn(msg, entry.data ?? "");
        break;
      case "error":
        console.error(msg, entry.data ?? "");
        break;
    }
  }

  private persistError(message: string, data?: unknown): void {
    try {
      const raw = this.storage.getRaw(STORAGE_KEYS.LOG_BUFFER) ?? "[]";
      const buffer: LogEntry[] = JSON.parse(raw) as LogEntry[];
      buffer.push({
        timestamp: new Date().toISOString(),
        level: "error",
        message,
        ...(data !== undefined ? { data } : {}),
      });
      const trimmed = buffer.slice(-50);
      this.storage.setRaw(STORAGE_KEYS.LOG_BUFFER, JSON.stringify(trimmed));
    } catch {
      // Storage full or unavailable - ignore
    }
  }
}
