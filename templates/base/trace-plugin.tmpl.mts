import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the Elysia trace plugin.
 * Adds traceId on onRequest, logs response on onAfterHandle, logs errors on onError.
 */
export function renderTracePlugin(_context: IGenerationContext): string {
  return `import { Elysia } from "elysia";
import { ulid } from "ulidx";
import type winston from "winston";

/**
 * Elysia plugin that adds request tracing via ULID trace IDs.
 * Logs request/response on every handled request and logs errors.
 */
export function tracePlugin(logger: winston.Logger): Elysia {
  return new Elysia({ name: "trace-plugin" })
    .onRequest(({ request, store }) => {
      const traceId = ulid();
      (store as Record<string, unknown>)["traceId"] = traceId;
      logger.info("Incoming request", {
        traceId,
        method: request.method,
        url: request.url,
      });
    })
    .onAfterHandle(({ request, response, store }) => {
      const traceId = (store as Record<string, unknown>)["traceId"] as string;
      logger.info("Request handled", {
        traceId,
        method: request.method,
        url: request.url,
        status: (response as { status?: number } | null)?.status ?? 200,
      });
    })
    .onError(({ request, error, store }) => {
      const traceId = (store as Record<string, unknown>)["traceId"] as string;
      logger.error("Request error", {
        traceId,
        method: request.method,
        url: request.url,
        error,
      });
    });
}
`;
}
