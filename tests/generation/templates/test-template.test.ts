import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { registeredSheetsFixture } from "../../fixtures/registered-sheets.fixture.ts";
import { photoAnalysisFixture } from "../../fixtures/photo-analysis.fixture.ts";
import { renderTest } from "../../../templates/base/test.tmpl.mts";

describe("test.tmpl.mts", () => {
  describe("Configuration", () => {
    const output = renderTest(configurationFixture);

    it("uses bun:test imports", () => {
      expect(output)
.toContain('from "bun:test"');
    });

    it("has describe block for ConfigurationService", () => {
      expect(output)
.toContain('describe("ConfigurationService"');
    });

    it("has test stub for getAll", () => {
      expect(output)
.toContain("getAll");
    });

    it("has test stub for getById", () => {
      expect(output)
.toContain("getById");
    });

    it("has test stub for create", () => {
      expect(output)
.toContain("create");
    });

    it("has test stub for update", () => {
      expect(output)
.toContain("update");
    });

    it("has test stub for deleteConfiguration", () => {
      expect(output)
.toContain("deleteConfiguration");
    });

    it("uses mock repository with in-memory pattern", () => {
      expect(output)
.toContain("createMockRepository");
    });

    it("has expect assertions", () => {
      expect(output)
.toContain("expect(");
    });
  });

  describe("RegisteredSheets", () => {
    const output = renderTest(registeredSheetsFixture);

    it("has describe block for RegisteredSheetService", () => {
      expect(output)
.toContain('describe("RegisteredSheetService"');
    });

    it("has deleteRegisteredSheet test", () => {
      expect(output)
.toContain("deleteRegisteredSheet");
    });
  });

  describe("PhotoAnalysis", () => {
    const output = renderTest(photoAnalysisFixture);

    it("has describe block for PhotoAnalysisService", () => {
      expect(output)
.toContain('describe("PhotoAnalysisService"');
    });

    it("has deletePhotoAnalysis test", () => {
      expect(output)
.toContain("deletePhotoAnalysis");
    });
  });
});
