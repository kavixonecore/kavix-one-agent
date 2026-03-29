import { createLogger } from "../logger/logger.mjs";

import type { IFeatureSpec, IFieldSpec } from "../core/interfaces/index.mjs";

const logger = createLogger("feature-extractor");

const DEFAULT_FIELDS: IFieldSpec[] = [
  { name: "createdAt", type: "Date", required: true },
  { name: "updatedAt", type: "Date", required: true },
];

/**
 * Normalises raw feature specs parsed from PRD or prompt.
 * - Ensures PascalCase entityName, kebab-case name, camelCase fields
 * - Derives pluralName and collectionName
 * - Injects default fields (_id, createdAt, updatedAt) if missing
 *
 * @param rawFeatures - Features as parsed (possibly with inconsistent casing)
 */
export function extractFeatures(rawFeatures: IFeatureSpec[]): IFeatureSpec[] {
  return rawFeatures.map((raw) => {
    const entityName = toPascalCase(raw.entityName || raw.name);
    const name = toKebabCase(entityName);
    const pluralName = raw.pluralName ?? `${name}s`;
    const collectionName = raw.collectionName ?? entityName.toLowerCase();
    const fields = normaliseFields(raw.fields, entityName);

    const spec: IFeatureSpec = {
      name,
      entityName,
      pluralName,
      collectionName,
      fields,
      enums: raw.enums ?? [],
      indexes: raw.indexes ?? [],
      description: raw.description,
    };

    logger.debug("Extracted feature spec", { entityName, fields: fields.length });
    return spec;
  });
}

function normaliseFields(rawFields: IFieldSpec[], entityName: string): IFieldSpec[] {
  const fields: IFieldSpec[] = rawFields.map((f) => ({
    ...f,
    name: toCamelCase(f.name),
  }));

  // Inject createdAt / updatedAt if missing
  for (const defaultField of DEFAULT_FIELDS) {
    if (!fields.some((f) => f.name === defaultField.name)) {
      logger.debug("Injecting default field", { entityName, field: defaultField.name });
      fields.push({ ...defaultField });
    }
  }

  return fields;
}

function toPascalCase(str: string): string {
  if (!str) {
return str;
}
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0)
.toUpperCase() + word.slice(1))
    .join("");
}

function toKebabCase(str: string): string {
  if (!str) {
return str;
}
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toCamelCase(str: string): string {
  if (!str) {
return str;
}
  const pascal = toPascalCase(str);
  return pascal.charAt(0)
.toLowerCase() + pascal.slice(1);
}
