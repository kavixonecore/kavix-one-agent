import { createLogger } from "../logger/logger.mjs";

import type { IFeatureSpec, IFieldSpec } from "../core/interfaces/index.mjs";
import type { FieldType } from "../core/types/index.mjs";

const logger = createLogger("prd-parser");

/**
 * Parses a PRD markdown document into an array of feature specs.
 *
 * Supported PRD format:
 * - Unchecked checkboxes (`- [ ] FeatureName`) identify features to generate
 * - `### Feature: EntityName` sections define entity details
 * - Field tables with columns: Field | Type | Required | Description
 * - Field lists with format: `- fieldName: type (required|optional)`
 *
 * @param prdContent - Raw PRD markdown string
 */
export function parsePrd(prdContent: string): IFeatureSpec[] {
  const specs: IFeatureSpec[] = [];

  // Find all feature sections: ### Feature: EntityName
  const featureSectionPattern = /^###\s+Feature:\s+(\w+)/gm;
  let match: RegExpExecArray | null;

  while ((match = featureSectionPattern.exec(prdContent)) !== null) {
    const entityName = match[1];
    const sectionStart = match.index + match[0].length;

    // Find the end of this section (next ### Feature: heading or end of string)
    // Use exact 3 hashes match (not ####) to avoid cutting at sub-headings
    const nextHeading = /^### /gm;
    nextHeading.lastIndex = sectionStart;
    const nextMatch = nextHeading.exec(prdContent);
    const sectionEnd = nextMatch ? nextMatch.index : prdContent.length;
    const sectionContent = prdContent.slice(sectionStart, sectionEnd);

    const fields = parseFields(sectionContent, entityName);
    const description = parseDescription(sectionContent);

    const name = toKebabCase(entityName);
    const pluralName = `${name}s`;
    const collectionName = entityName.toLowerCase();

    const spec: IFeatureSpec = {
      name,
      entityName,
      pluralName,
      collectionName,
      fields,
      enums: [],
      indexes: [],
      description,
    };

    specs.push(spec);
    logger.debug("Parsed feature spec from PRD", { entityName, fields: fields.length });
  }

  // Fallback: if no ### Feature: sections, parse unchecked checkboxes as feature names
  if (specs.length === 0) {
    const checkboxPattern = /^- \[ \] (.+)$/gm;
    let cbMatch: RegExpExecArray | null;

    while ((cbMatch = checkboxPattern.exec(prdContent)) !== null) {
      const rawName = cbMatch[1].trim();
      const entityName = toPascalCase(rawName);
      const name = toKebabCase(entityName);

      const spec: IFeatureSpec = {
        name,
        entityName,
        pluralName: `${name}s`,
        collectionName: entityName.toLowerCase(),
        fields: defaultFields(),
        enums: [],
        indexes: [],
        description: `${entityName} feature`,
      };

      specs.push(spec);
      logger.debug("Parsed feature from checkbox", { rawName, entityName });
    }
  }

  logger.info("PRD parsing complete", { features: specs.length });
  return specs;
}

function parseFields(sectionContent: string, entityName: string): IFieldSpec[] {
  const fields: IFieldSpec[] = [];

  // Try table format: | fieldName | type | required | description |
  // Skip header rows (field names that are exactly "field" or "name") and separator rows
  const tableRowPattern = /^\|\s*([a-zA-Z]\w*)\s*\|\s*(\w+)\s*\|\s*(yes|no|true|false|required|optional)\s*\|/gim;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRowPattern.exec(sectionContent)) !== null) {
    const fieldName = tableMatch[1];
    // Skip header row where the column headers are used as field names
    if (fieldName.toLowerCase() === "field" && tableMatch[2].toLowerCase() === "type") {
      continue;
    }
    const rawType = tableMatch[2].toLowerCase();
    const requiredStr = tableMatch[3].toLowerCase();
    const required = requiredStr === "yes" || requiredStr === "true" || requiredStr === "required";
    const fieldType = resolveFieldType(rawType);

    fields.push({ name: fieldName, type: fieldType, required });
  }

  // Try list format: `- fieldName: type (required|optional)`
  if (fields.length === 0) {
    const listPattern = /^-\s+(\w+):\s*(\w+)(?:\s*\((required|optional)\))?/gm;
    let listMatch: RegExpExecArray | null;

    while ((listMatch = listPattern.exec(sectionContent)) !== null) {
      const fieldName = listMatch[1];
      const rawType = listMatch[2].toLowerCase();
      const requiredHint = listMatch[3];
      const required = requiredHint !== "optional";
      const fieldType = resolveFieldType(rawType);

      fields.push({ name: fieldName, type: fieldType, required });
    }
  }

  if (fields.length === 0) {
    logger.debug("No fields parsed; using defaults", { entityName });
    return defaultFields();
  }

  return fields;
}

function parseDescription(sectionContent: string): string {
  // Look for a description line after the heading
  const descPattern = /^>\s*(.+)$/m;
  const match = descPattern.exec(sectionContent);
  return match ? match[1].trim() : "";
}

function resolveFieldType(raw: string): FieldType {
  const map: Record<string, FieldType> = {
    string: "string",
    str: "string",
    text: "string",
    number: "number",
    num: "number",
    int: "number",
    integer: "number",
    float: "number",
    boolean: "boolean",
    bool: "boolean",
    date: "Date",
    datetime: "Date",
    objectid: "ObjectId",
    object: "object",
    obj: "object",
  };
  return map[raw] ?? "string";
}

function defaultFields(): IFieldSpec[] {
  return [
    { name: "name", type: "string", required: true },
    { name: "description", type: "string", required: false },
  ];
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0)
.toUpperCase() + word.slice(1)
.toLowerCase())
    .join("");
}
