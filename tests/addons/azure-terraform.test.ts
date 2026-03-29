import { describe, it, expect } from "bun:test";

import { azureTerraformTemplate } from "../../templates/addons/azure-terraform/index.mjs";
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

describe("azure-terraform addon", () => {
  describe("template metadata", () => {
    it("has name azure-terraform", () => {
      expect(azureTerraformTemplate.name)
.toBe("azure-terraform");
    });

    it("has type ADDON", () => {
      expect(azureTerraformTemplate.type)
.toBe(TemplateType.ADDON);
    });

    it("has a non-empty description", () => {
      expect(azureTerraformTemplate.description.length)
.toBeGreaterThan(0);
    });
  });

  describe("plan()", () => {
    const planned = azureTerraformTemplate.plan(configurationFixture);

    it("returns 4 files", () => {
      expect(planned)
.toHaveLength(4);
    });

    it("includes infrastructure/main.tf", () => {
      expect(planned.some((f) => f.path === "infrastructure/main.tf"))
.toBe(true);
    });

    it("includes infrastructure/variables.tf", () => {
      expect(planned.some((f) => f.path === "infrastructure/variables.tf"))
.toBe(true);
    });

    it("includes infrastructure/providers.tf", () => {
      expect(planned.some((f) => f.path === "infrastructure/providers.tf"))
.toBe(true);
    });

    it("includes infrastructure/outputs.tf", () => {
      expect(planned.some((f) => f.path === "infrastructure/outputs.tf"))
.toBe(true);
    });

    it("every planned file has templateName azure-terraform", () => {
      for (const f of planned) {
        expect(f.templateName)
.toBe("azure-terraform");
      }
    });
  });

  describe("render()", () => {
    const rendered = azureTerraformTemplate.render(configurationFixture, context);

    it("returns 4 rendered files", () => {
      expect(rendered)
.toHaveLength(4);
    });

    it("providers.tf contains azurerm provider", () => {
      const file = rendered.find((f) => f.path === "infrastructure/providers.tf");
      expect(file?.content)
.toContain("hashicorp/azurerm");
    });

    it("variables.tf contains project_name variable", () => {
      const file = rendered.find((f) => f.path === "infrastructure/variables.tf");
      expect(file?.content)
.toContain("project_name");
      expect(file?.content)
.toContain("my-api");
    });

    it("variables.tf contains environment variable", () => {
      const file = rendered.find((f) => f.path === "infrastructure/variables.tf");
      expect(file?.content)
.toContain("environment");
    });

    it("main.tf contains resource group", () => {
      const file = rendered.find((f) => f.path === "infrastructure/main.tf");
      expect(file?.content)
.toContain("azurerm_resource_group");
    });

    it("main.tf contains cosmos db", () => {
      const file = rendered.find((f) => f.path === "infrastructure/main.tf");
      expect(file?.content)
.toContain("azurerm_cosmosdb_account");
    });

    it("main.tf contains managed identity", () => {
      const file = rendered.find((f) => f.path === "infrastructure/main.tf");
      expect(file?.content)
.toContain("azurerm_user_assigned_identity");
    });

    it("main.tf contains key vault", () => {
      const file = rendered.find((f) => f.path === "infrastructure/main.tf");
      expect(file?.content)
.toContain("azurerm_key_vault");
    });

    it("main.tf contains container registry", () => {
      const file = rendered.find((f) => f.path === "infrastructure/main.tf");
      expect(file?.content)
.toContain("azurerm_container_registry");
    });

    it("main.tf contains container app", () => {
      const file = rendered.find((f) => f.path === "infrastructure/main.tf");
      expect(file?.content)
.toContain("azurerm_container_app");
    });

    it("outputs.tf contains container_app_url", () => {
      const file = rendered.find((f) => f.path === "infrastructure/outputs.tf");
      expect(file?.content)
.toContain("container_app_url");
    });

    it("does NOT include storage queue when feature has no queue description", () => {
      const file = rendered.find((f) => f.path === "infrastructure/main.tf");
      expect(file?.content).not.toContain("azurerm_storage_queue");
    });

    it("includes storage queue when feature description mentions queue", () => {
      const queueFeature = {
        ...configurationFixture,
        description: "Configuration store with queue processing",
      };
      const queueRendered = azureTerraformTemplate.render(queueFeature, context);
      const mainTf = queueRendered.find((f) => f.path === "infrastructure/main.tf");
      expect(mainTf?.content)
.toContain("azurerm_storage_queue");
    });
  });

  describe("validate()", () => {
    it("returns valid=true for correct set of files", () => {
      const rendered = azureTerraformTemplate.render(configurationFixture, context);
      const result = azureTerraformTemplate.validate(rendered);
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("returns valid=false when a required file is missing", () => {
      const rendered = azureTerraformTemplate.render(configurationFixture, context);
      const withoutMain = rendered.filter((f) => f.path !== "infrastructure/main.tf");
      const result = azureTerraformTemplate.validate(withoutMain);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("main.tf")))
.toBe(true);
    });

    it("returns valid=false when a file has empty content", () => {
      const rendered = azureTerraformTemplate.render(configurationFixture, context);
      const withEmpty = rendered.map((f) =>
        f.path === "infrastructure/providers.tf" ? { ...f, content: "" } : f
      );
      const result = azureTerraformTemplate.validate(withEmpty);
      expect(result.valid)
.toBe(false);
    });
  });
});
