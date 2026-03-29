import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { registeredSheetsFixture } from "../../fixtures/registered-sheets.fixture.ts";
import { photoAnalysisFixture } from "../../fixtures/photo-analysis.fixture.ts";
import { renderService } from "../../../templates/base/service.tmpl.mts";

describe("service.tmpl.mts", () => {
  describe("Configuration", () => {
    const output = renderService(configurationFixture);

    it("exports ConfigurationService class", () => {
      expect(output)
.toContain("export class ConfigurationService");
    });

    it("constructor receives IConfigurationRepository and logger", () => {
      expect(output)
.toContain("IConfigurationRepository");
      expect(output)
.toContain("winston.Logger");
    });

    it("has getAll method with explicit return type", () => {
      expect(output)
.toContain("public async getAll(): Promise<IConfiguration[]>");
    });

    it("has getById method", () => {
      expect(output)
.toContain("public async getById");
    });

    it("has create method", () => {
      expect(output)
.toContain("public async create");
    });

    it("has update method", () => {
      expect(output)
.toContain("public async update");
    });

    it("has deleteConfiguration method", () => {
      expect(output)
.toContain("public async deleteConfiguration");
    });

    it("each method has try-catch with logger.error", () => {
      expect(output)
.toContain("this.#logger.error");
    });

    it("uses private class field syntax for repository and logger", () => {
      expect(output)
.toContain("readonly #repository");
      expect(output)
.toContain("readonly #logger");
    });
  });

  describe("RegisteredSheets", () => {
    const output = renderService(registeredSheetsFixture);

    it("exports RegisteredSheetService", () => {
      expect(output)
.toContain("export class RegisteredSheetService");
    });

    it("has deleteRegisteredSheet method", () => {
      expect(output)
.toContain("public async deleteRegisteredSheet");
    });
  });

  describe("PhotoAnalysis", () => {
    const output = renderService(photoAnalysisFixture);

    it("exports PhotoAnalysisService", () => {
      expect(output)
.toContain("export class PhotoAnalysisService");
    });

    it("has getAll returning PhotoAnalysis array", () => {
      expect(output)
.toContain("Promise<IPhotoAnalysis[]>");
    });
  });
});
