import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { orgsRouter } from "./routes/orgs.router.mjs";
import { rolesRouter } from "./routes/roles.router.mjs";
import { connectionsRouter } from "./routes/connections.router.mjs";
import { invitesRouter } from "./routes/invites.router.mjs";
import { auditRouter } from "./routes/audit.router.mjs";

export function createApp(): Elysia {
  const app = new Elysia()
    .use(cors())
    .use(openapi({
      path: "/swagger",
      provider: "scalar",
      documentation: {
        info: {
          title: "Auth0 Management API",
          version: "0.1.0",
          description: "Centralized Auth0 management API for all Kavix One projects",
        },
      },
    }))
    .get("/health", () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }))
    .get("/version", () => ({
      version: "0.1.0",
      environment: process.env["NODE_ENV"] ?? "development",
    }))
    .group("/v1", (group) =>
      group
        .use(orgsRouter())
        .use(rolesRouter())
        .use(connectionsRouter())
        .use(invitesRouter())
        .use(auditRouter()),
    );

  return app;
}
