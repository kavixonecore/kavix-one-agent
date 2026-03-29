import { describe, it, expect } from "bun:test";

import { externalApiClientTemplate } from "../../templates/addons/external-api-client/index.mjs";
import { TemplateType } from "../../src/core/enums/index.mjs";
import { configurationFixture } from "../fixtures/configuration.fixture.ts";

import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

const context: IGenerationContext = {
  projectName: "my-api",
  projectScope: "my-api",
  outputDir: "/tmp/out",
  features: [configurationFixture],
  dryRun: true,
};

describe("external-api-client addon", () => {
  describe("template metadata", () => {
    it("has name external-api-client", () => {
      expect(externalApiClientTemplate.name)
.toBe("external-api-client");
    });

    it("has type ADDON", () => {
      expect(externalApiClientTemplate.type)
.toBe(TemplateType.ADDON);
    });

    it("has a non-empty description", () => {
      expect(externalApiClientTemplate.description.length)
.toBeGreaterThan(0);
    });
  });

  describe("plan()", () => {
    const planned = externalApiClientTemplate.plan(configurationFixture);

    it("returns 4 files", () => {
      expect(planned)
.toHaveLength(4);
    });

    it("includes service.mts", () => {
      expect(planned.some((f) => f.path.endsWith("/service.mts")))
.toBe(true);
    });

    it("includes response interface", () => {
      expect(planned.some((f) => f.path.endsWith("-response.mts")))
.toBe(true);
    });

    it("includes config interface", () => {
      expect(planned.some((f) => f.path.endsWith("-config.mts")))
.toBe(true);
    });

    it("includes barrel index.mts", () => {
      expect(planned.some((f) => f.path.endsWith("/index.mts")))
.toBe(true);
    });
  });

  describe("render()", () => {
    const rendered = externalApiClientTemplate.render(configurationFixture, context);

    it("returns 4 rendered files", () => {
      expect(rendered)
.toHaveLength(4);
    });

    it("service.mts contains Axios import", () => {
      const file = rendered.find((f) => f.path.endsWith("/service.mts"));
      expect(file?.content)
.toContain("import axios");
    });

    it("service.mts contains OAuth2 token method", () => {
      const file = rendered.find((f) => f.path.endsWith("/service.mts"));
      expect(file?.content)
.toContain("#getToken");
      expect(file?.content)
.toContain("client_credentials");
    });

    it("service.mts has token caching logic", () => {
      const file = rendered.find((f) => f.path.endsWith("/service.mts"));
      expect(file?.content)
.toContain("#cachedToken");
      expect(file?.content)
.toContain("#tokenExpiresAt");
    });

    it("service.mts has retry logic", () => {
      const file = rendered.find((f) => f.path.endsWith("/service.mts"));
      expect(file?.content)
.toContain("#requestWithRetry");
      expect(file?.content)
.toContain("#MAX_RETRIES");
    });

    it("service.mts has GET, POST, PUT, DELETE methods", () => {
      const file = rendered.find((f) => f.path.endsWith("/service.mts"));
      expect(file?.content)
.toContain("public async get<");
      expect(file?.content)
.toContain("public async post<");
      expect(file?.content)
.toContain("public async put<");
      expect(file?.content)
.toContain("public async delete<");
    });

    it("service.mts uses Winston logger", () => {
      const file = rendered.find((f) => f.path.endsWith("/service.mts"));
      expect(file?.content)
.toContain("winston");
    });

    it("response interface exports I{Pascal}Response", () => {
      const file = rendered.find((f) => f.path.endsWith("-response.mts"));
      expect(file?.content)
.toContain("export interface IConfigurationResponse");
    });

    it("config interface exports I{Pascal}Config", () => {
      const file = rendered.find((f) => f.path.endsWith("-config.mts"));
      expect(file?.content)
.toContain("export interface IConfigurationConfig");
    });

    it("config interface has required OAuth2 fields", () => {
      const file = rendered.find((f) => f.path.endsWith("-config.mts"));
      expect(file?.content)
.toContain("baseUrl: string");
      expect(file?.content)
.toContain("clientId: string");
      expect(file?.content)
.toContain("clientSecret: string");
      expect(file?.content)
.toContain("tokenUrl: string");
    });

    it("barrel index.mts exports the service class", () => {
      const file = rendered.find((f) => f.path.endsWith("/index.mts"));
      expect(file?.content)
.toContain("export { ConfigurationService }");
    });

    it("barrel index.mts exports the interfaces", () => {
      const file = rendered.find((f) => f.path.endsWith("/index.mts"));
      expect(file?.content)
.toContain("IConfigurationConfig");
      expect(file?.content)
.toContain("IConfigurationResponse");
    });
  });

  describe("validate()", () => {
    it("returns valid=true for correct rendered files", () => {
      const rendered = externalApiClientTemplate.render(configurationFixture, context);
      const result = externalApiClientTemplate.validate(rendered);
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("returns valid=false for empty files array", () => {
      const result = externalApiClientTemplate.validate([]);
      expect(result.valid)
.toBe(false);
    });

    it("returns valid=false when service file is missing", () => {
      const rendered = externalApiClientTemplate.render(configurationFixture, context);
      const withoutService = rendered.filter((f) => !f.path.endsWith("/service.mts"));
      const result = externalApiClientTemplate.validate(withoutService);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("service")))
.toBe(true);
    });

    it("returns valid=false when config interface is missing", () => {
      const rendered = externalApiClientTemplate.render(configurationFixture, context);
      const withoutConfig = rendered.filter((f) => !f.path.endsWith("-config.mts"));
      const result = externalApiClientTemplate.validate(withoutConfig);
      expect(result.valid)
.toBe(false);
    });
  });
});
