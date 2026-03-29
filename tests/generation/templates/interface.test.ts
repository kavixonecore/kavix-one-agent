import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { photoAnalysisFixture } from "../../fixtures/photo-analysis.fixture.ts";
import { registeredSheetsFixture } from "../../fixtures/registered-sheets.fixture.ts";
import { renderInterface } from "../../../templates/base/interface.tmpl.mts";

describe("interface.tmpl.mts", () => {
  describe("Configuration (simple CRUD)", () => {
    const output = renderInterface(configurationFixture);

    it("exports IConfiguration interface", () => {
      expect(output)
.toContain("export interface IConfiguration");
    });

    it("includes _id?: ObjectId field", () => {
      expect(output)
.toContain("_id?: ObjectId");
    });

    it("has required fields without optional marker", () => {
      expect(output)
.toContain("serviceName: string;");
      expect(output)
.toContain("configKey: string;");
      expect(output)
.toContain("configValue: string;");
      expect(output)
.toContain("isActive: boolean;");
    });

    it("has optional field with ? marker", () => {
      expect(output)
.toContain("description?: string;");
    });

    it("does NOT have readonly on properties", () => {
      const lines = output.split("\n");
      const propertyLines = lines.filter(
        (l) => l.includes(": ") && !l.includes("//") && !l.includes("*")
      );
      for (const line of propertyLines) {
        expect(line).not.toContain("readonly ");
      }
    });

    it("imports ObjectId from mongodb", () => {
      expect(output)
.toContain('from "mongodb"');
    });
  });

  describe("RegisteredSheets (medium)", () => {
    const output = renderInterface(registeredSheetsFixture);

    it("exports IRegisteredSheet interface", () => {
      expect(output)
.toContain("export interface IRegisteredSheet");
    });

    it("includes all required fields", () => {
      expect(output)
.toContain("sheetId: string;");
      expect(output)
.toContain("sheetName: string;");
      expect(output)
.toContain("workspaceId: string;");
    });

    it("has array field for columnMappings", () => {
      expect(output)
.toContain("columnMappings");
    });
  });

  describe("PhotoAnalysis (complex, nested objects)", () => {
    const output = renderInterface(photoAnalysisFixture);

    it("exports IPhotoAnalysis interface", () => {
      expect(output)
.toContain("export interface IPhotoAnalysis");
    });

    it("renders nested surveyData object", () => {
      expect(output)
.toContain("surveyData");
      expect(output)
.toContain("siteId");
      expect(output)
.toContain("surveyType");
    });

    it("renders nested array analysisItems", () => {
      expect(output)
.toContain("analysisItems");
      expect(output)
.toContain("checkId");
      expect(output)
.toContain("passed");
    });
  });
});
