import type { IFeatureSpec, IFieldSpec } from "../../src/core/interfaces/index.mjs";
import type { FieldType } from "../../src/core/types/index.mjs";

/**
 * Maps a FieldType to a Zod validator expression.
 */
function toZodValidator(field: IFieldSpec): string {
  if (field.nestedFields && field.nestedFields.length > 0) {
    const nested = field.nestedFields
      .map((f) => `    ${f.name}: ${toZodValidator(f)},`)
      .join("\n");
    const obj = `z.object({\n${nested}\n  })`;
    return field.isArray ? `z.array(${obj})` : obj;
  }

  const typeMap: Record<FieldType, string> = {
    string: field.required ? "z.string().min(1)" : "z.string().optional()",
    number: field.required ? "z.number()" : "z.number().optional()",
    boolean: field.required ? "z.boolean()" : "z.boolean().optional()",
    Date: field.required ? "z.coerce.date()" : "z.coerce.date().optional()",
    ObjectId: field.required ? "z.string().min(1)" : "z.string().optional()",
    object: "z.record(z.string(), z.unknown()).optional()",
    unknown: "z.unknown()",
  };

  const base = typeMap[field.type] ?? "z.unknown()";
  if (field.isArray) {
    return `z.array(${base})`;
  }
  return base;
}

/**
 * Renders the Zod validation schema and derived type for an entity.
 */
export function renderSchema(feature: IFeatureSpec): string {
  const { entityName, fields } = feature;
  const schemaName = `${entityName}Schema`;
  const lowerName = entityName.charAt(0)
.toLowerCase() + entityName.slice(1);
  const validateFnName = `validate${entityName}`;

  const fieldLines = fields
    .map((f) => `  ${f.name}: ${toZodValidator(f)},`)
    .join("\n");

  return `import { z } from "zod";

export const ${schemaName} = z.object({
${fieldLines}
});

export type ${entityName} = z.infer<typeof ${schemaName}>;

/**
 * Validates raw input against the ${entityName} schema.
 * Returns a typed result — callers must check .success before using .data.
 */
export function ${validateFnName}(
  raw: unknown
): z.SafeParseReturnType<unknown, ${entityName}> {
  return ${schemaName}
    .safeParse(raw);
}

export const ${lowerName}CreateSchema = ${schemaName}
  .omit({ _id: true } as Partial<Record<keyof ${entityName}, true>>);
`;
}
