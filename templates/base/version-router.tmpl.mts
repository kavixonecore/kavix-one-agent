import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the /version route for the generated project.
 */
export function renderVersionRouter(_context: IGenerationContext): string {
  return `import { Elysia } from "elysia";

/**
 * Version router. GET /version returns { version, buildTime, gitCommit }.
 */
export function versionRouter(): Elysia {
  return new Elysia()
    .get("/version", () => ({
      version: process.env["npm_package_version"] ?? "0.0.0",
      buildTime: new Date().toISOString(),
      gitCommit: process.env["GIT_COMMIT"] ?? "unknown",
    }));
}
`;
}
