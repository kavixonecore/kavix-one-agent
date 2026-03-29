import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the Swagger detail objects for all CRUD routes.
 * These are imported into the router to keep route files clean.
 */
export function renderSwaggerDetail(feature: IFeatureSpec): string {
  const { entityName, pluralName } = feature;
  const lowerName = entityName.charAt(0)
.toLowerCase() + entityName.slice(1);
  const tag = pluralName.charAt(0)
.toUpperCase() + pluralName.slice(1);

  return `/**
 * Swagger detail objects for ${entityName} routes.
 * Imported by the router to keep route files minimal.
 */

export const get${pluralName.charAt(0)
.toUpperCase() + pluralName.slice(1)}Detail = {
  tags: ["${tag}"],
  summary: "Get all ${pluralName}",
  description: "Returns a paginated list of all ${pluralName}.",
  response: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array" },
              count: { type: "number" },
            },
          },
        },
      },
    },
  },
};

export const get${entityName}ByIdDetail = {
  tags: ["${tag}"],
  summary: "Get ${lowerName} by ID",
  description: "Returns a single ${lowerName} by its MongoDB ObjectId.",
  response: {
    200: { description: "Found" },
    404: { description: "Not found" },
  },
};

export const create${entityName}Detail = {
  tags: ["${tag}"],
  summary: "Create ${lowerName}",
  description: "Creates a new ${lowerName} record.",
  response: {
    201: { description: "Created" },
    400: { description: "Validation error" },
  },
};

export const update${entityName}Detail = {
  tags: ["${tag}"],
  summary: "Update ${lowerName}",
  description: "Updates an existing ${lowerName} by ID.",
  response: {
    200: { description: "Updated" },
    404: { description: "Not found" },
  },
};

export const delete${entityName}Detail = {
  tags: ["${tag}"],
  summary: "Delete ${lowerName}",
  description: "Deletes a ${lowerName} record by ID.",
  response: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
  },
};
`;
}
