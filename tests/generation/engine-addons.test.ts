import { describe, it, expect, beforeEach } from "bun:test";

import { createTestLogger } from "../fixtures/test-logger.fixture.ts";
import { GenerationEngine } from "../../src/generation/engine.mjs";
import { TemplateRegistry } from "../../src/generation/template-registry.mjs";
import { TemplateType } from "../../src/core/enums/index.mjs";
import { configurationFixture } from "../fixtures/configuration.fixture.ts";

import type {
  IGenerationPlan,
  IRenderedFile,
  ITemplate,
  IFeatureSpec,
  IGenerationContext,
} from "../../src/core/interfaces/index.mjs";

function makeAddonTemplate(name: string, files: IRenderedFile[] = []): ITemplate {
  return {
    name,
    type: TemplateType.ADDON,
    description: `Test addon ${name}`,
    plan: (_f: IFeatureSpec) => [],
    render: (_f: IFeatureSpec, _ctx: IGenerationContext) => files,
    validate: (_rendered: IRenderedFile[]) => ({ valid: true, errors: [], warnings: [] }),
  };
}

function makePlan(addons?: string[]): IGenerationPlan {
  return {
    projectName: "test-project",
    projectDescription: "Test project",
    features: [configurationFixture],
    addons,
    status: "pending",
    createdAt: new Date()
.toISOString(),
    updatedAt: new Date()
.toISOString(),
  };
}

describe("GenerationEngine — addon integration", () => {
  let registry: TemplateRegistry;
  let engine: GenerationEngine;

  beforeEach(() => {
    registry = new TemplateRegistry(createTestLogger());
    engine = new GenerationEngine(createTestLogger(), registry);
  });

  describe("constructor", () => {
    it("accepts optional TemplateRegistry", () => {
      const customRegistry = new TemplateRegistry(createTestLogger());
      const e = new GenerationEngine(createTestLogger(), customRegistry);
      expect(e)
.toBeDefined();
    });

    it("creates a default registry when none provided", () => {
      const e = new GenerationEngine(createTestLogger());
      expect(e)
.toBeDefined();
    });
  });

  describe("generate() with addons", () => {
    it("succeeds when plan has no addons", async () => {
      const plan = makePlan(undefined);
      const result = await engine.generate(plan, "/tmp/test-output", true);
      expect(result)
.toBeDefined();
      expect(result.errors)
.toBeArray();
    });

    it("succeeds when plan has empty addons array", async () => {
      const plan = makePlan([]);
      const result = await engine.generate(plan, "/tmp/test-output", true);
      expect(result)
.toBeDefined();
    });

    it("records error when addon name is not in registry", async () => {
      const plan = makePlan(["non-existent-addon"]);
      const result = await engine.generate(plan, "/tmp/test-output", true);
      expect(result.errors.some((e) => e.includes("non-existent-addon")))
.toBe(true);
      expect(result.success)
.toBe(false);
    });

    it("applies addon template when registered and produces no errors", async () => {
      const addon = makeAddonTemplate("my-test-addon", [
        { path: "infra/test.tf", content: "# test terraform" },
      ]);
      registry.registerAddon(addon);

      const plan = makePlan(["my-test-addon"]);
      // dryRun = true so files aren't actually written
      const result = await engine.generate(plan, "/tmp/test-output", true);
      expect(result.errors.some((e) => e.includes("my-test-addon")))
.toBe(false);
    });

    it("records error when addon's own validate() returns invalid", async () => {
      const failingAddon: ITemplate = {
        name: "failing-validation-addon",
        type: TemplateType.ADDON,
        description: "Addon whose validate always fails",
        plan: (_f: IFeatureSpec) => [],
        render: (_f: IFeatureSpec, _ctx: IGenerationContext) => [
          { path: "some/file.tf", content: "content" },
        ],
        validate: (_rendered: IRenderedFile[]) => ({
          valid: false,
          errors: ["render validation failure"],
          warnings: [],
        }),
      };
      registry.registerAddon(failingAddon);

      const plan = makePlan(["failing-validation-addon"]);
      const result = await engine.generate(plan, "/tmp/test-output", true);
      expect(result.errors.some((e) => e.includes("render validation failure")))
.toBe(true);
    });

    it("records error when addon render() throws", async () => {
      const throwingAddon: ITemplate = {
        name: "throwing-addon",
        type: TemplateType.ADDON,
        description: "Addon that throws during render",
        plan: (_f: IFeatureSpec) => [],
        render: () => {
 throw new Error("render boom");
},
        validate: (_r: IRenderedFile[]) => ({ valid: true, errors: [], warnings: [] }),
      };
      registry.registerAddon(throwingAddon);

      const plan = makePlan(["throwing-addon"]);
      const result = await engine.generate(plan, "/tmp/test-output", true);
      expect(result.errors.some((e) => e.includes("throwing-addon")))
.toBe(true);
    });

    it("continues to next addon after one fails", async () => {
      const goodAddon = makeAddonTemplate("good-addon", [
        { path: "good/file.txt", content: "good" },
      ]);
      registry.registerAddon(goodAddon);

      const plan = makePlan(["missing-addon", "good-addon"]);
      const result = await engine.generate(plan, "/tmp/test-output", true);
      // Should have error for missing-addon but not good-addon
      expect(result.errors.some((e) => e.includes("missing-addon")))
.toBe(true);
      expect(result.errors.some((e) => e.includes("good-addon")))
.toBe(false);
    });
  });

  describe("IGenerationPlan.addons field", () => {
    it("plan with addons field compiles and passes type check", () => {
      const plan: IGenerationPlan = {
        projectName: "test",
        projectDescription: "test desc",
        features: [],
        addons: ["azure-terraform", "teams-notification"],
        status: "pending",
        createdAt: new Date()
.toISOString(),
        updatedAt: new Date()
.toISOString(),
      };
      expect(plan.addons)
.toHaveLength(2);
    });

    it("plan without addons field is valid (addons is optional)", () => {
      const plan: IGenerationPlan = {
        projectName: "test",
        projectDescription: "test desc",
        features: [],
        status: "pending",
        createdAt: new Date()
.toISOString(),
        updatedAt: new Date()
.toISOString(),
      };
      expect(plan.addons)
.toBeUndefined();
    });
  });
});
