import Anthropic from "@anthropic-ai/sdk";

import { createLogger } from "../logger/logger.mjs";

import type { IFeatureSpec, IFieldSpec } from "../core/interfaces/index.mjs";
import type { FieldType } from "../core/types/index.mjs";

const logger = createLogger("prompt-parser");

const SYSTEM_PROMPT = `You are an API schema extractor. Given a plain English description of an API,
extract the entities, their fields, and relationships.

Respond ONLY with valid JSON in this exact format:
{
  "features": [
    {
      "entityName": "PascalCase entity name",
      "description": "brief description",
      "fields": [
        {
          "name": "camelCase field name",
          "type": "string | number | boolean | Date | ObjectId | object",
          "required": true or false,
          "description": "optional field description"
        }
      ]
    }
  ]
}

Rules:
- entityName must be PascalCase (e.g., WorkOrder, not work_order)
- field names must be camelCase
- Use ObjectId for reference fields (e.g., technicianId pointing to another entity)
- Use Date for timestamps
- Include _id, createdAt, updatedAt for every entity
- Keep descriptions concise
- Do not include any text outside the JSON`;

interface IRawFeatureResponse {
  features: IRawFeatureData[];
}

interface IRawFeatureData {
  entityName: string;
  description?: string;
  fields: IRawFieldData[];
}

interface IRawFieldData {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

/**
 * Uses Claude to parse a natural language prompt into an array of feature specs.
 * Falls back gracefully if the response cannot be parsed.
 *
 * @param prompt - Natural language description of the API to generate
 * @param apiKey - Anthropic API key
 */
export async function parsePrompt(prompt: string, apiKey: string): Promise<IFeatureSpec[]> {
  logger.info("Parsing prompt with Claude", { promptLength: prompt.length });

  const client = new Anthropic({ apiKey });

  let responseText: string;

  try {
    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      logger.error("Unexpected content type from Claude", { type: content.type });
      return [];
    }
    responseText = content.text;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Claude API call failed", { error: message });
    return [];
  }

  return parseClaudeResponse(responseText);
}

function parseClaudeResponse(responseText: string): IFeatureSpec[] {
  let parsed: unknown;

  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = /\{[\s\S]*\}/.exec(responseText);
    if (!jsonMatch) {
      logger.warn("No JSON found in Claude response");
      return [];
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to parse Claude response as JSON", { error: msg });
    return [];
  }

  if (!isRawFeatureResponse(parsed)) {
    logger.warn("Claude response did not match expected schema");
    return [];
  }

  const specs = parsed.features.map((rawFeature) => {
    const fields: IFieldSpec[] = rawFeature.fields.map((rawField) => ({
      name: rawField.name,
      type: resolveFieldType(rawField.type),
      required: rawField.required,
      description: rawField.description,
    }));

    const name = toKebabCase(rawFeature.entityName);
    const spec: IFeatureSpec = {
      name,
      entityName: rawFeature.entityName,
      pluralName: `${name}s`,
      collectionName: rawFeature.entityName.toLowerCase(),
      fields,
      enums: [],
      indexes: [],
      description: rawFeature.description,
    };

    return spec;
  });

  logger.info("Parsed features from prompt", { count: specs.length });
  return specs;
}

function isRawFeatureResponse(value: unknown): value is IRawFeatureResponse {
  if (typeof value !== "object" || value === null) {
return false;
}
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj["features"])) {
return false;
}

  return obj["features"].every((item: unknown) => {
    if (typeof item !== "object" || item === null) {
return false;
}
    const f = item as Record<string, unknown>;
    return (
      typeof f["entityName"] === "string" &&
      Array.isArray(f["fields"])
    );
  });
}

function resolveFieldType(raw: string): FieldType {
  const map: Record<string, FieldType> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    Date: "Date",
    date: "Date",
    ObjectId: "ObjectId",
    objectid: "ObjectId",
    object: "object",
  };
  return map[raw] ?? "string";
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
