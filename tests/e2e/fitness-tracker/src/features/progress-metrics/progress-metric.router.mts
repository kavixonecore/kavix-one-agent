import { Elysia, t } from "elysia";
import type { ProgressMetricService } from "./progress-metric.service.mjs";
import type { Logger } from "winston";
import { createProgressMetricSchema } from "./schemas/create-progress-metric.schema.mjs";
import { updateProgressMetricSchema } from "./schemas/update-progress-metric.schema.mjs";
import { progressMetricQuerySchema, metricTypeParamsSchema } from "./schemas/progress-metric-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createProgressMetricRouter = (loggerInstance: Logger, service: ProgressMetricService) => {
  return new Elysia({ prefix: "/progress-metrics" })
    .post(
      "/",
      async ({ body, set }) => {
        const parsed = createProgressMetricSchema.safeParse(body);
        if (!parsed.success) {
          set.status = 400;
          return { success: false, error: parsed.error.message };
        }
        const result = await service.create(parsed.data);
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        set.status = 201;
        return { success: true, data: result.value };
      },
      {
        body: t.Unknown(),
        detail: { tags: ["Progress Metrics"], summary: "Create progress metric" },
      },
    )
    .get(
      "/",
      async ({ query, set }) => {
        const parsed = progressMetricQuerySchema.safeParse(query);
        if (!parsed.success) {
          set.status = 400;
          return { success: false, error: parsed.error.message };
        }
        const result = await service.findAll(parsed.data);
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value.data, count: result.value.count };
      },
      {
        detail: { tags: ["Progress Metrics"], summary: "List progress metrics" },
      },
    )
    .get(
      "/latest",
      async ({ set }) => {
        loggerInstance.debug("Getting latest metrics");
        const result = await service.getLatest();
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value, count: result.value.length };
      },
      {
        detail: { tags: ["Progress Metrics"], summary: "Get latest metric of each type" },
      },
    )
    .get(
      "/by-type/:metricType",
      async ({ params, query, set }) => {
        const parsedParams = metricTypeParamsSchema.safeParse(params);
        if (!parsedParams.success) {
          set.status = 400;
          return { success: false, error: parsedParams.error.message };
        }
        const result = await service.findByMetricType(
          parsedParams.data.metricType,
          (query as { startDate?: string }).startDate,
          (query as { endDate?: string }).endDate,
        );
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value, count: result.value.length };
      },
      {
        detail: { tags: ["Progress Metrics"], summary: "Get metrics by type" },
      },
    )
    .get(
      "/:id",
      async ({ params, set }) => {
        const result = await service.findById(params["id"] ?? "");
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value };
      },
      {
        detail: { tags: ["Progress Metrics"], summary: "Get progress metric by ID" },
      },
    )
    .put(
      "/:id",
      async ({ params, body, set }) => {
        const parsed = updateProgressMetricSchema.safeParse(body);
        if (!parsed.success) {
          set.status = 400;
          return { success: false, error: parsed.error.message };
        }
        const result = await service.update(params["id"] ?? "", parsed.data);
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value };
      },
      {
        body: t.Unknown(),
        detail: { tags: ["Progress Metrics"], summary: "Update progress metric" },
      },
    )
    .delete(
      "/:id",
      async ({ params, set }) => {
        const result = await service.delete(params["id"] ?? "");
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: { deleted: result.value } };
      },
      {
        detail: { tags: ["Progress Metrics"], summary: "Delete progress metric" },
      },
    );
};
