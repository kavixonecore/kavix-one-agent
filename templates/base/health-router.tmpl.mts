import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the /healthz route for the generated project.
 */
export function renderHealthRouter(_context: IGenerationContext): string {
  return `import { Elysia } from "elysia";

/**
 * Health check router. GET /healthz returns { status, timestamp, service }.
 */
export function healthRouter(): Elysia {
  return new Elysia()
    .get("/healthz", () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "api",
    }));
}
`;
}
