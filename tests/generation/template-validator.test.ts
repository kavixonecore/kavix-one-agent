import { describe, it, expect } from "bun:test";

import { validateTemplate } from "../../src/generation/template-validator.mjs";
import { TemplateType } from "../../src/core/enums/index.mjs";

import type { IFeatureSpec, IGenerationContext } from "../../src/core/interfaces/index.mjs";

function makeValidTemplate(): object {
  return {
    name: "test-addon",
    type: TemplateType.ADDON,
    description: "A valid test addon template",
    plan: (_feature: IFeatureSpec) => [],
    render: (_feature: IFeatureSpec, _ctx: IGenerationContext) => [],
    validate: () => ({ valid: true, errors: [], warnings: [] }),
  };
}

describe("validateTemplate()", () => {
  describe("valid template", () => {
    it("returns valid=true for a correctly implemented template", () => {
      const result = validateTemplate(makeValidTemplate());
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("accepts BASE type templates as valid", () => {
      const template = { ...makeValidTemplate(), type: TemplateType.BASE };
      const result = validateTemplate(template);
      expect(result.valid)
.toBe(true);
    });
  });

  describe("null / non-object input", () => {
    it("returns valid=false for null", () => {
      const result = validateTemplate(null);
      expect(result.valid)
.toBe(false);
      expect(result.errors[0])
.toContain("non-null object");
    });

    it("returns valid=false for a string", () => {
      const result = validateTemplate("not-a-template");
      expect(result.valid)
.toBe(false);
    });

    it("returns valid=false for undefined", () => {
      const result = validateTemplate(undefined);
      expect(result.valid)
.toBe(false);
    });
  });

  describe("missing required properties", () => {
    it("errors when name is missing", () => {
      const t = { ...makeValidTemplate(), name: undefined };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("name")))
.toBe(true);
    });

    it("errors when name is empty string", () => {
      const t = { ...makeValidTemplate(), name: "  " };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
    });

    it("errors when description is missing", () => {
      const t = { ...makeValidTemplate(), description: undefined };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("description")))
.toBe(true);
    });

    it("errors when type is missing", () => {
      const t = { ...makeValidTemplate(), type: undefined };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("type")))
.toBe(true);
    });

    it("errors when type is an invalid value", () => {
      const t = { ...makeValidTemplate(), type: "invalid-type" };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("type")))
.toBe(true);
    });
  });

  describe("missing methods", () => {
    it("errors when plan() is missing", () => {
      const { plan: _plan, ...rest } = makeValidTemplate() as Record<string, unknown>;
      const result = validateTemplate(rest);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("plan")))
.toBe(true);
    });

    it("errors when render() is missing", () => {
      const { render: _render, ...rest } = makeValidTemplate() as Record<string, unknown>;
      const result = validateTemplate(rest);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("render")))
.toBe(true);
    });

    it("errors when validate() is missing", () => {
      const { validate: _validate, ...rest } = makeValidTemplate() as Record<string, unknown>;
      const result = validateTemplate(rest);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("validate")))
.toBe(true);
    });
  });

  describe("wrong return types", () => {
    it("errors when plan() does not return an array", () => {
      const t = { ...makeValidTemplate(), plan: () => "not-an-array" };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("plan()")))
.toBe(true);
    });

    it("errors when render() does not return an array", () => {
      const t = { ...makeValidTemplate(), render: () => 42 };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("render()")))
.toBe(true);
    });

    it("errors when validate() does not return IValidationResult shape", () => {
      const t = { ...makeValidTemplate(), validate: () => ({ ok: true }) };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("validate()")))
.toBe(true);
    });

    it("errors when validate() returns wrong shape (missing warnings)", () => {
      const t = {
        ...makeValidTemplate(),
        validate: () => ({ valid: true, errors: [] }),
      };
      const result = validateTemplate(t);
      expect(result.valid)
.toBe(false);
    });
  });

  describe("methods that throw during probe", () => {
    it("records a warning (not an error) when plan() throws", () => {
      const t = {
        ...makeValidTemplate(),
        plan: () => {
 throw new Error("probe error");
},
      };
      const result = validateTemplate(t);
      // Should still be valid since throwing is warned, not errored
      expect(result.warnings.some((w) => w.includes("plan()")))
.toBe(true);
    });

    it("records a warning when render() throws", () => {
      const t = {
        ...makeValidTemplate(),
        render: () => {
 throw new Error("render error");
},
      };
      const result = validateTemplate(t);
      expect(result.warnings.some((w) => w.includes("render()")))
.toBe(true);
    });

    it("records a warning when validate() throws", () => {
      const t = {
        ...makeValidTemplate(),
        validate: () => {
 throw new Error("validate error");
},
      };
      const result = validateTemplate(t);
      expect(result.warnings.some((w) => w.includes("validate()")))
.toBe(true);
    });
  });
});
