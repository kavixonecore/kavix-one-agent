import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the Elysia router factory for an entity.
 * Clean/minimal — swagger detail imported from docs/ folder.
 * Response format: { success: true, data, count } or { success: false, error }.
 */
export function renderRouter(feature: IFeatureSpec): string {
  const { entityName, pluralName } = feature;
  const lowerName = entityName.charAt(0)
.toLowerCase() + entityName.slice(1);
  const serviceInterfaceName = `I${entityName}Service`;
  const routerName = `${lowerName}Router`;
  const prefix = `/api/${pluralName}`;

  const pluralCap = pluralName.charAt(0)
.toUpperCase() + pluralName.slice(1);

  return `import { Elysia } from "elysia";
import type winston from "winston";

import type { ${serviceInterfaceName} } from "../service/i-${lowerName}-service.mjs";
import {
  get${pluralCap}Detail,
  get${entityName}ByIdDetail,
  create${entityName}Detail,
  update${entityName}Detail,
  delete${entityName}Detail,
} from "../docs/${lowerName}-swagger.mjs";

/**
 * Router factory for ${entityName} CRUD routes.
 */
export const ${routerName} = (
  logger: winston.Logger,
  ${lowerName}Service: ${serviceInterfaceName}
): Elysia => {
  return new Elysia({ prefix: "${prefix}" })
    .get(
      "/",
      async ({ set }) => {
        try {
          const items = await ${lowerName}Service.getAll();
          return { success: true, data: items, count: items.length };
        } catch (error: unknown) {
          logger.error("Error fetching ${pluralName}", { error });
          set.status = 500;
          return { success: false, error: "Failed to fetch ${pluralName}" };
        }
      },
      get${pluralCap}Detail
    )
    .get(
      "/:id",
      async ({ params, set }) => {
        try {
          const item = await ${lowerName}Service.getById(params.id as unknown as import("mongodb").ObjectId);
          if (!item) {
            set.status = 404;
            return { success: false, error: "${entityName} not found" };
          }
          return { success: true, data: item };
        } catch (error: unknown) {
          logger.error("Error fetching ${lowerName}", { id: params.id, error });
          set.status = 500;
          return { success: false, error: "Failed to fetch ${lowerName}" };
        }
      },
      get${entityName}ByIdDetail
    )
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const created = await ${lowerName}Service.create(
            body as Omit<import("../interfaces/index.mjs").I${entityName}, "_id">
          );
          set.status = 201;
          return { success: true, data: created };
        } catch (error: unknown) {
          logger.error("Error creating ${lowerName}", { error });
          set.status = 400;
          return { success: false, error: "Failed to create ${lowerName}" };
        }
      },
      create${entityName}Detail
    )
    .put(
      "/:id",
      async ({ params, body, set }) => {
        try {
          const updated = await ${lowerName}Service.update(
            params.id as unknown as import("mongodb").ObjectId,
            body as Partial<import("../interfaces/index.mjs").I${entityName}>
          );
          if (!updated) {
            set.status = 404;
            return { success: false, error: "${entityName} not found" };
          }
          return { success: true, data: updated };
        } catch (error: unknown) {
          logger.error("Error updating ${lowerName}", { id: params.id, error });
          set.status = 500;
          return { success: false, error: "Failed to update ${lowerName}" };
        }
      },
      update${entityName}Detail
    )
    .delete(
      "/:id",
      async ({ params, set }) => {
        try {
          const deleted = await ${lowerName}Service.delete${entityName}(
            params.id as unknown as import("mongodb").ObjectId
          );
          if (!deleted) {
            set.status = 404;
            return { success: false, error: "${entityName} not found" };
          }
          return { success: true, data: null };
        } catch (error: unknown) {
          logger.error("Error deleting ${lowerName}", { id: params.id, error });
          set.status = 500;
          return { success: false, error: "Failed to delete ${lowerName}" };
        }
      },
      delete${entityName}Detail
    );
};
`;
}
