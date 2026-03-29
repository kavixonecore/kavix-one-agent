import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { registeredSheetsFixture } from "../../fixtures/registered-sheets.fixture.ts";
import { photoAnalysisFixture } from "../../fixtures/photo-analysis.fixture.ts";
import { renderSwaggerDetail } from "../../../templates/base/swagger-detail.tmpl.mts";

describe("swagger-detail.tmpl.mts", () => {
  describe("Configuration", () => {
    const output = renderSwaggerDetail(configurationFixture);

    it("exports getConfigurationsDetail", () => {
      expect(output)
.toContain("export const getConfigurationsDetail");
    });

    it("exports getConfigurationByIdDetail", () => {
      expect(output)
.toContain("export const getConfigurationByIdDetail");
    });

    it("exports createConfigurationDetail", () => {
      expect(output)
.toContain("export const createConfigurationDetail");
    });

    it("exports updateConfigurationDetail", () => {
      expect(output)
.toContain("export const updateConfigurationDetail");
    });

    it("exports deleteConfigurationDetail", () => {
      expect(output)
.toContain("export const deleteConfigurationDetail");
    });

    it("has tags array in each detail", () => {
      expect(output)
.toContain("tags:");
    });

    it("has summary in each detail", () => {
      expect(output)
.toContain("summary:");
    });

    it("has response schema in getAll detail", () => {
      expect(output)
.toContain("response:");
    });
  });

  describe("RegisteredSheets", () => {
    const output = renderSwaggerDetail(registeredSheetsFixture);

    it("exports getRegisteredSheetsDetail", () => {
      expect(output)
.toContain("export const getRegisteredSheetsDetail");
    });

    it("exports createRegisteredSheetDetail", () => {
      expect(output)
.toContain("export const createRegisteredSheetDetail");
    });
  });

  describe("PhotoAnalysis", () => {
    const output = renderSwaggerDetail(photoAnalysisFixture);

    it("exports getPhotoAnalysesDetail", () => {
      expect(output)
.toContain("export const getPhotoAnalysesDetail");
    });

    it("exports createPhotoAnalysisDetail", () => {
      expect(output)
.toContain("export const createPhotoAnalysisDetail");
    });
  });
});
