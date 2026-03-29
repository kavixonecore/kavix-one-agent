import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { renderContainer } from "../../../templates/base/container.tmpl.mts";
import { renderContainerInterface } from "../../../templates/base/container-interface.tmpl.mts";
import { renderEnvConfig } from "../../../templates/base/env-config.tmpl.mts";
import { renderServer } from "../../../templates/base/server.tmpl.mts";
import { renderHealthRouter } from "../../../templates/base/health-router.tmpl.mts";
import { renderVersionRouter } from "../../../templates/base/version-router.tmpl.mts";
import { renderTracePlugin } from "../../../templates/base/trace-plugin.tmpl.mts";
import { renderLogger } from "../../../templates/base/logger.tmpl.mts";
import { renderRepositoryFactory } from "../../../templates/base/repository-factory.tmpl.mts";

import type { IGenerationContext } from "../../../src/core/interfaces/index.mjs";

const testContext: IGenerationContext = {
  projectName: "my-api",
  projectScope: "myorg",
  outputDir: "/tmp/test-output",
  features: [configurationFixture],
  dryRun: false,
};

const emptyContext: IGenerationContext = {
  ...testContext,
  features: [],
};

describe("container.tmpl.mts", () => {
  const output = renderContainer(testContext);

  it("exports async getContainer function", () => {
    expect(output)
.toContain("export async function getContainer");
  });

  it("imports and instantiates ConfigurationRepository", () => {
    expect(output)
.toContain("ConfigurationRepository");
  });

  it("calls await repo.init()", () => {
    expect(output)
.toContain("await configurationRepo.init()");
  });

  it("instantiates ConfigurationService", () => {
    expect(output)
.toContain("ConfigurationService");
  });

  it("returns IContainer shape with db, databaseConfig, repositories, services, helpers", () => {
    expect(output)
.toContain("db,");
    expect(output)
.toContain("databaseConfig,");
    expect(output)
.toContain("repositories:");
    expect(output)
.toContain("services:");
    expect(output)
.toContain("helpers: {}");
  });
});

describe("container-interface.tmpl.mts", () => {
  const output = renderContainerInterface(testContext);

  it("exports IContainer interface", () => {
    expect(output)
.toContain("export interface IContainer");
  });

  it("has db property typed as MongoClient", () => {
    expect(output)
.toContain("db: MongoClient");
  });

  it("has repositories block with configurationRepo", () => {
    expect(output)
.toContain("configurationRepo");
  });

  it("has services block with configurationService", () => {
    expect(output)
.toContain("configurationService");
  });
});

describe("env-config.tmpl.mts", () => {
  const output = renderEnvConfig(emptyContext);

  it("uses z.object({}).parse(Bun.env)", () => {
    expect(output)
.toContain("envSchema.parse(Bun.env)");
  });

  it("has NODE_ENV field", () => {
    expect(output)
.toContain("NODE_ENV");
  });

  it("has MONGO_ fields", () => {
    expect(output)
.toContain("MONGO_HOSTNAME");
    expect(output)
.toContain("MONGO_USERNAME");
    expect(output)
.toContain("MONGO_PASSWORD");
    expect(output)
.toContain("MONGO_CLUSTER_NAME");
  });

  it("exports env singleton", () => {
    expect(output)
.toContain("export const env = envSchema.parse(Bun.env)");
  });
});

describe("server.tmpl.mts", () => {
  const output = renderServer(testContext);

  it("creates Elysia app", () => {
    expect(output)
.toContain("new Elysia()");
  });

  it("uses cors plugin", () => {
    expect(output)
.toContain(".use(cors())");
  });

  it("uses swagger plugin", () => {
    expect(output)
.toContain(".use(swagger(");
  });

  it("uses tracePlugin", () => {
    expect(output)
.toContain("tracePlugin");
  });

  it("mounts configurationRouter", () => {
    expect(output)
.toContain("configurationRouter");
  });

  it("exports createServer function", () => {
    expect(output)
.toContain("export function createServer");
  });
});

describe("health-router.tmpl.mts", () => {
  const output = renderHealthRouter(emptyContext);

  it("exports healthRouter function", () => {
    expect(output)
.toContain("export function healthRouter");
  });

  it("has GET /health route returning status ok", () => {
    expect(output)
.toContain("/health");
    expect(output)
.toContain("status: \"ok\"");
  });

  it("returns timestamp in response", () => {
    expect(output)
.toContain("timestamp");
  });
});

describe("version-router.tmpl.mts", () => {
  const output = renderVersionRouter(emptyContext);

  it("exports versionRouter function", () => {
    expect(output)
.toContain("export function versionRouter");
  });

  it("has GET /version route", () => {
    expect(output)
.toContain("/version");
  });

  it("returns version, buildTime, gitCommit", () => {
    expect(output)
.toContain("version");
    expect(output)
.toContain("buildTime");
    expect(output)
.toContain("gitCommit");
  });
});

describe("trace-plugin.tmpl.mts", () => {
  const output = renderTracePlugin(emptyContext);

  it("exports tracePlugin function", () => {
    expect(output)
.toContain("export function tracePlugin");
  });

  it("generates ULID trace ID on request", () => {
    expect(output)
.toContain("ulid()");
    expect(output)
.toContain("onRequest");
  });

  it("logs on onAfterHandle", () => {
    expect(output)
.toContain("onAfterHandle");
    expect(output)
.toContain("logger.info");
  });

  it("logs error on onError", () => {
    expect(output)
.toContain("onError");
    expect(output)
.toContain("logger.error");
  });
});

describe("logger.tmpl.mts", () => {
  const output = renderLogger(emptyContext);

  it("exports createLogger function", () => {
    expect(output)
.toContain("export function createLogger");
  });

  it("uses winston.createLogger", () => {
    expect(output)
.toContain("winston.createLogger");
  });

  it("has JSON format with timestamp", () => {
    expect(output)
.toContain("format.json()");
    expect(output)
.toContain("format.timestamp()");
  });
});

describe("repository-factory.tmpl.mts", () => {
  const output = renderRepositoryFactory(emptyContext);

  it("exports createRepository function", () => {
    expect(output)
.toContain("export function createRepository");
  });

  it("exports IRepositoryFactoryConfig interface", () => {
    expect(output)
.toContain("export interface IRepositoryFactoryConfig");
  });

  it("is generic over D and T", () => {
    expect(output)
.toContain("<D, T>");
  });

  it("imports IRepository from @sylvesterllc/mongo", () => {
    expect(output)
.toContain("@sylvesterllc/mongo");
  });
});
