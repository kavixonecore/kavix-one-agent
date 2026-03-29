import { TemplateType } from "../core/enums/index.mjs";

import type { IValidationResult } from "../core/interfaces/index.mjs";

/**
 * Validates that an unknown value correctly implements the ITemplate contract.
 * Used before rendering addon templates to catch missing or malformed implementations.
 */
export function validateTemplate(template: unknown): IValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof template !== "object" || template === null) {
    errors.push("Template must be a non-null object");
    return { valid: false, errors, warnings };
  }

  const obj = template as Record<string, unknown>;

  // Check required string properties
  if (typeof obj["name"] !== "string" || obj["name"].trim() === "") {
    errors.push("Template must have a non-empty string 'name' property");
  }

  if (typeof obj["description"] !== "string" || obj["description"].trim() === "") {
    errors.push("Template must have a non-empty string 'description' property");
  }

  // Check 'type' property is a valid TemplateType value
  const validTypes = Object.values(TemplateType) as string[];
  if (typeof obj["type"] !== "string") {
    errors.push("Template must have a string 'type' property");
  } else if (!validTypes.includes(obj["type"])) {
    errors.push(
      `Template 'type' must be one of [${validTypes.join(", ")}], got '${obj["type"]}'`
    );
  }

  // Check required methods exist and are functions
  const methods = ["plan", "render", "validate"] as const;
  for (const method of methods) {
    if (typeof obj[method] !== "function") {
      errors.push(`Template must have a '${method}()' method`);
    }
  }

  // Shallow return-type checks: call each method with minimal args and
  // check the returned shape. Only do this when the method exists.
  if (typeof obj["plan"] === "function") {
    try {
      const result = (obj["plan"] as (...args: unknown[]) => unknown)({});
      if (!Array.isArray(result)) {
        errors.push("Template plan() must return an array (IGeneratedFile[])");
      }
    } catch {
      warnings.push("Template plan() threw an error during validation probe — ensure it handles minimal input");
    }
  }

  if (typeof obj["render"] === "function") {
    try {
      const result = (obj["render"] as (...args: unknown[]) => unknown)({}, {});
      if (!Array.isArray(result)) {
        errors.push("Template render() must return an array (IRenderedFile[])");
      }
    } catch {
      warnings.push("Template render() threw an error during validation probe — ensure it handles minimal input");
    }
  }

  if (typeof obj["validate"] === "function") {
    try {
      const result = (obj["validate"] as (...args: unknown[]) => unknown)([]);
      if (
        typeof result !== "object" ||
        result === null ||
        typeof (result as Record<string, unknown>)["valid"] !== "boolean" ||
        !Array.isArray((result as Record<string, unknown>)["errors"]) ||
        !Array.isArray((result as Record<string, unknown>)["warnings"])
      ) {
        errors.push(
          "Template validate() must return IValidationResult { valid: boolean; errors: string[]; warnings: string[] }"
        );
      }
    } catch {
      warnings.push("Template validate() threw an error during validation probe — ensure it handles empty array input");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
