import { describe, it, expect, beforeEach } from "bun:test";

import { createTestLogger } from "../fixtures/test-logger.fixture.ts";
import { TemplateRegistry } from "../../src/generation/template-registry.mjs";
import { TemplateType } from "../../src/core/enums/index.mjs";

import type {
  ITemplate,
  IFeatureSpec,
  IGenerationContext,
} from "../../src/core/interfaces/index.mjs";

function makeAddonTemplate(name: string): ITemplate {
  return {
    name,
    type: TemplateType.ADDON,
    description: `Test addon: ${name}`,
    plan: (_feature: IFeatureSpec) => [],
    render: (_feature: IFeatureSpec, _ctx: IGenerationContext) => [],
    validate: () => ({ valid: true, errors: [], warnings: [] }),
  };
}

describe("TemplateRegistry — addon methods", () => {
  let registry: TemplateRegistry;

  beforeEach(() => {
    registry = new TemplateRegistry(createTestLogger());
  });

  describe("registerAddon()", () => {
    it("registers an addon template", () => {
      const addon = makeAddonTemplate("my-addon");
      registry.registerAddon(addon);
      expect(registry.has("my-addon"))
.toBe(true);
    });

    it("overwrites an existing addon (with warning, no throw)", () => {
      const addon1 = makeAddonTemplate("dup-addon");
      const addon2 = makeAddonTemplate("dup-addon");
      registry.registerAddon(addon1);
      expect(() => registry.registerAddon(addon2)).not.toThrow();
      expect(registry.has("dup-addon"))
.toBe(true);
    });
  });

  describe("getAddon()", () => {
    it("returns the addon by name", () => {
      const addon = makeAddonTemplate("lookup-addon");
      registry.registerAddon(addon);
      const result = registry.getAddon("lookup-addon");
      expect(result)
.toBeDefined();
      expect(result?.name)
.toBe("lookup-addon");
    });

    it("returns undefined for unknown name", () => {
      expect(registry.getAddon("no-such-addon"))
.toBeUndefined();
    });

    it("returns undefined when template is BASE type, not ADDON", () => {
      const baseTemplate: ITemplate = {
        name: "base-template",
        type: TemplateType.BASE,
        description: "a base template",
        plan: () => [],
        render: () => [],
        validate: () => ({ valid: true, errors: [], warnings: [] }),
      };
      registry.register(baseTemplate);
      expect(registry.getAddon("base-template"))
.toBeUndefined();
    });
  });

  describe("listAddons()", () => {
    it("returns empty array when no addons registered", () => {
      expect(registry.listAddons())
.toEqual([]);
    });

    it("returns all registered addons", () => {
      registry.registerAddon(makeAddonTemplate("addon-a"));
      registry.registerAddon(makeAddonTemplate("addon-b"));
      const addons = registry.listAddons();
      expect(addons)
.toHaveLength(2);
      expect(addons.map((a) => a.name))
.toContain("addon-a");
      expect(addons.map((a) => a.name))
.toContain("addon-b");
    });

    it("does NOT include base templates in the list", () => {
      const base: ITemplate = {
        name: "some-base",
        type: TemplateType.BASE,
        description: "base",
        plan: () => [],
        render: () => [],
        validate: () => ({ valid: true, errors: [], warnings: [] }),
      };
      registry.register(base);
      registry.registerAddon(makeAddonTemplate("only-addon"));
      const addons = registry.listAddons();
      expect(addons)
.toHaveLength(1);
      expect(addons[0].name)
.toBe("only-addon");
    });
  });

  describe("discoverAddons()", () => {
    it("returns empty array for a non-existent directory (no throw)", async () => {
      const result = await registry.discoverAddons("/no/such/dir/anywhere");
      expect(result)
.toEqual([]);
    });

    it("returns empty array for an empty directory", async () => {
      const tmpDir = `${import.meta.dir}/../fixtures/empty-addons-dir`;
      await Bun.write(`${tmpDir}/.keep`, "");
      const result = await registry.discoverAddons(tmpDir);
      expect(result)
.toEqual([]);
    });
  });
});
