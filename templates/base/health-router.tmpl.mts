import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the /health route for the generated project.
 */
export function renderHealthRouter(_context: IGenerationContext): string {
  return `import { Elysia } from "elysia";

/**
 * Health check router. GET /health returns { status, timestamp, service }.
 */
export function healthRouter(): Elysia {
  return new Elysia()
    .get("/health", () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "api",
    }));
}
`;
}
