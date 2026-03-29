import type winston from "winston";
import type { MongoClient } from "mongodb";

import type { IAuditLogEntry } from "./interfaces/i-audit-log-entry.mjs";

const COLLECTION = "auth_audit_log";

/**
 * Dual-write auth event logger.
 * Writes structured logs via Winston AND inserts into MongoDB auth_audit_log.
 * MongoDB write is fire-and-forget — failures are logged but never thrown.
 */
export class AuthAuditLogger {

  readonly #logger: winston.Logger;

  readonly #db: MongoClient | undefined;

  readonly #dbName: string | undefined;

  public constructor(
    logger: winston.Logger,
    db?: MongoClient,
    dbName?: string,
  ) {
    this.#logger = logger;
    this.#db = db;
    this.#dbName = dbName;
  }

  public log(entry: IAuditLogEntry): void {
    this.#writeToWinston(entry);
    this.#writeToMongo(entry);
  }

  #writeToWinston(entry: IAuditLogEntry): void {
    const level = entry.event === "success" ? "info" : "warn";
    this.#logger[level]("auth_audit", {
      event: entry.event,
      sub: entry.sub,
      ip: entry.ip,
      path: entry.path,
      method: entry.method,
      statusCode: entry.statusCode,
      reason: entry.reason,
    });
  }

  #writeToMongo(entry: IAuditLogEntry): void {
    if (!this.#db || !this.#dbName) return;

    this.#db
      .db(this.#dbName)
      .collection(COLLECTION)
      .insertOne({ ...entry })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.#logger.error("AuthAuditLogger: failed to write to MongoDB", { error: message });
      });
  }
}
