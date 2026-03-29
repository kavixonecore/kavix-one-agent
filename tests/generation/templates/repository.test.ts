import { describe, it, expect } from "bun:test";

import { configurationFixture } from "../../fixtures/configuration.fixture.ts";
import { registeredSheetsFixture } from "../../fixtures/registered-sheets.fixture.ts";
import { photoAnalysisFixture } from "../../fixtures/photo-analysis.fixture.ts";
import { renderRepository } from "../../../templates/base/repository.tmpl.mts";

describe("repository.tmpl.mts", () => {
  describe("Configuration", () => {
    const output = renderRepository(configurationFixture);

    it("exports ConfigurationRepository extending BaseRepository", () => {
      expect(output)
.toContain("export class ConfigurationRepository extends BaseRepository");
    });

    it("uses MongoClient and IConfiguration generics", () => {
      expect(output)
.toContain("BaseRepository<MongoClient, IConfiguration>");
    });

    it("has async init() method", () => {
      expect(output)
.toContain("public async init(): Promise<void>");
    });

    it("calls ensureIndexes in init", () => {
      expect(output)
.toContain("await this.ensureIndexes()");
    });

    it("creates the composite unique index", () => {
      expect(output)
.toContain("serviceName: 1");
      expect(output)
.toContain("configKey: 1");
      expect(output)
.toContain("unique: true");
      expect(output)
.toContain("idx_service_config");
    });

    it("imports IDatabase from @sylvesterllc/mongo", () => {
      expect(output)
.toContain("@sylvesterllc/mongo");
    });
  });

  describe("RegisteredSheets (multiple indexes)", () => {
    const output = renderRepository(registeredSheetsFixture);

    it("creates both defined indexes", () => {
      expect(output)
.toContain("idx_sheet_id");
      expect(output)
.toContain("idx_workspace_status");
    });

    it("marks sheetId index as unique", () => {
      expect(output)
.toContain("unique: true");
    });

    it("marks workspace_status index as not unique", () => {
      expect(output)
.toContain("unique: false");
    });
  });

  describe("PhotoAnalysis", () => {
    const output = renderRepository(photoAnalysisFixture);

    it("exports PhotoAnalysisRepository", () => {
      expect(output)
.toContain("export class PhotoAnalysisRepository extends BaseRepository");
    });

    it("has instanceId unique index", () => {
      expect(output)
.toContain("idx_instance_id");
    });
  });
});
