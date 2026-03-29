import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { photoAnalysisFixture } from "../../fixtures/photo-analysis.fixture.ts";
import { registeredSheetsFixture } from "../../fixtures/registered-sheets.fixture.ts";
import { renderSchema } from "../../../templates/base/schema.tmpl.mts";

describe("schema.tmpl.mts", () => {
  describe("Configuration (simple CRUD)", () => {
    const output = renderSchema(configurationFixture);

    it("contains z.object(", () => {
      expect(output)
.toContain("z.object({");
    });

    it("exports ConfigurationSchema", () => {
      expect(output)
.toContain("export const ConfigurationSchema");
    });

    it("exports derived Configuration type", () => {
      expect(output)
.toContain("export type Configuration = z.infer<typeof ConfigurationSchema>");
    });

    it("exports validateConfiguration function", () => {
      expect(output)
.toContain("export function validateConfiguration");
      expect(output)
.toContain("safeParse");
    });

    it("required string fields use z.string().min(1)", () => {
      expect(output)
.toContain("serviceName: z.string()");
    });

    it("optional fields use .optional()", () => {
      expect(output)
.toContain("description: z.string().optional()");
    });

    it("boolean required field uses z.boolean()", () => {
      expect(output)
.toContain("isActive: z.boolean()");
    });
  });

  describe("RegisteredSheets (medium)", () => {
    const output = renderSchema(registeredSheetsFixture);

    it("exports RegisteredSheetSchema", () => {
      expect(output)
.toContain("export const RegisteredSheetSchema");
    });

    it("has optional date field", () => {
      expect(output)
.toContain("lastSyncedAt");
      expect(output)
.toContain("optional");
    });
  });

  describe("PhotoAnalysis (complex, nested)", () => {
    const output = renderSchema(photoAnalysisFixture);

    it("exports PhotoAnalysisSchema", () => {
      expect(output)
.toContain("export const PhotoAnalysisSchema");
    });

    it("contains nested z.object for surveyData", () => {
      expect(output)
.toContain("surveyData");
    });

    it("has z.array for analysisItems", () => {
      expect(output)
.toContain("analysisItems");
      expect(output)
.toContain("z.array");
    });
  });
});
