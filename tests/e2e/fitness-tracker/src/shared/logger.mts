import winston from "winston";
import { ulid } from "ulidx";
import { Elysia } from "elysia";

const logLevel = process.env["LOG_LEVEL"] ?? "info";

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createTracePlugin = () => {
  return new Elysia({ name: "trace-plugin" })
    .derive(() => ({ traceId: ulid() }))
    .onRequest(({ request }) => {
      logger.info("Incoming request", {
        method: request.method,
        url: request.url,
      });
    })
    .onAfterHandle(({ request, set }) => {
      logger.info("Request completed", {
        method: request.method,
        url: request.url,
        status: set.status,
      });
    })
    .onError(({ error, request }) => {
      logger.error("Request error", {
        method: request.method,
        url: request.url,
        error: error instanceof Error ? error.message : String(error),
      });
    });
};
