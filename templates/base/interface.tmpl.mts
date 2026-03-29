import type { IFeatureSpec, IFieldSpec } from "../../src/core/interfaces/index.mjs";
import type { FieldType } from "../../src/core/types/index.mjs";

/**
 * Maps a FieldType to its TypeScript type string.
 */
function toTsType(field: IFieldSpec): string {
  const typeMap: Record<FieldType, string> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    Date: "Date",
    ObjectId: "ObjectId",
    object: "Record<string, unknown>",
    unknown: "unknown",
  };

  if (field.nestedFields && field.nestedFields.length > 0) {
    const nested = field.nestedFields
      .map((f) => `    ${f.name}${f.required ? "" : "?"}: ${toTsType(f)};`)
      .join("\n");
    const objectType = `{\n${nested}\n  }`;
    return field.isArray ? `${objectType}[]` : objectType;
  }

  const base = typeMap[field.type] ?? "unknown";
  return field.isArray ? `${base}[]` : base;
}

/**
 * Renders the main entity interface file.
 * Generated interfaces do NOT have readonly on fields.
 */
export function renderInterface(feature: IFeatureSpec): string {
  const { entityName, fields } = feature;
  const interfaceName = `I${entityName}`;

  const fieldLines = fields
    .map((f) => {
      const optional = f.required ? "" : "?";
      return `  ${f.name}${optional}: ${toTsType(f)};`;
    })
    .join("\n");

  return `import type { ObjectId } from "mongodb";

/**
 * Domain entity interface for ${entityName}.
 */
export interface ${interfaceName} {

  _id?: ObjectId;
${fieldLines}
}
`;
}
