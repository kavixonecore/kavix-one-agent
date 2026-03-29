import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { registeredSheetsFixture } from "../../fixtures/registered-sheets.fixture.ts";
import { photoAnalysisFixture } from "../../fixtures/photo-analysis.fixture.ts";
import { renderRouter } from "../../../templates/base/router.tmpl.mts";

describe("router.tmpl.mts", () => {
  describe("Configuration", () => {
    const output = renderRouter(configurationFixture);

    it("is a factory function exporting configurationRouter", () => {
      expect(output)
.toContain("export const configurationRouter =");
    });

    it("returns new Elysia with /api/configurations prefix", () => {
      expect(output)
.toContain('new Elysia({ prefix: "/api/configurations" })');
    });

    it("has GET / route", () => {
      expect(output)
.toContain('.get(\n      "/"');
    });

    it("has GET /:id route", () => {
      expect(output)
.toContain('.get(\n      "/:id"');
    });

    it("has POST / route", () => {
      expect(output)
.toContain('.post(\n      "/"');
    });

    it("has PUT /:id route", () => {
      expect(output)
.toContain('.put(\n      "/:id"');
    });

    it("has DELETE /:id route", () => {
      expect(output)
.toContain('.delete(\n      "/:id"');
    });

    it("has success:true response format", () => {
      expect(output)
.toContain("success: true");
    });

    it("has success:false error format", () => {
      expect(output)
.toContain("success: false");
    });

    it("imports swagger detail from docs/ folder", () => {
      expect(output)
.toContain("../docs/configuration-swagger.mjs");
    });

    it("has try-catch in each route handler", () => {
      const tryCatchCount = (output.match(/try \{/g) ?? []).length;
      expect(tryCatchCount)
.toBeGreaterThanOrEqual(5);
    });

    it("uses set.status on errors", () => {
      expect(output)
.toContain("set.status = 500");
    });
  });

  describe("RegisteredSheets", () => {
    const output = renderRouter(registeredSheetsFixture);

    it("has /api/registeredSheets prefix", () => {
      expect(output)
.toContain("/api/registeredSheets");
    });

    it("imports swagger from registeredSheet-swagger", () => {
      expect(output)
.toContain("registeredSheet-swagger.mjs");
    });
  });

  describe("PhotoAnalysis", () => {
    const output = renderRouter(photoAnalysisFixture);

    it("exports photoAnalysisRouter factory", () => {
      expect(output)
.toContain("export const photoAnalysisRouter =");
    });
  });
});
