import type { IFeatureSpec, IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the Elysia server setup file: cors + swagger + tracePlugin + routes.
 */
export function renderServer(context: IGenerationContext): string {
  const { features } = context;

  const routerImports = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `import { ${lowerName}Router } from "./routes/${lowerName}-router.mjs";`;
    })
    .join("\n");

  const routerMounts = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `      .use(${lowerName}Router(logger, container.services.${lowerName}Service))`;
    })
    .join("\n");

  return `import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import type winston from "winston";

import { tracePlugin } from "./plugins/trace.plugin.mjs";
import { healthRouter } from "./routes/health-router.mjs";
import { versionRouter } from "./routes/version-router.mjs";
import type { IContainer } from "../ioc/interfaces/i-container.mjs";
${routerImports}

/**
 * Builds the Elysia application with all plugins and routes.
 */
export function createServer(
  logger: winston.Logger,
  container: IContainer
): Elysia {
  const apiRoutes = new Elysia({ prefix: "/v1" })
${routerMounts};

  return new Elysia()
    .use(cors())
    .use(openapi({ path: "/swagger", provider: "scalar" }))
    .use(tracePlugin(logger))
    .get("/", ({ redirect }) => redirect("/swagger"))
    .use(healthRouter())
    .use(versionRouter())
    .use(apiRoutes);
}
`;
}
