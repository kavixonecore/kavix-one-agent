import { Elysia, t } from "elysia";

import { createProgressMetricSchema } from "./schemas/create-progress-metric.schema.mjs";
import { updateProgressMetricSchema } from "./schemas/update-progress-metric.schema.mjs";
import { progressMetricQuerySchema, metricTypeParamsSchema } from "./schemas/progress-metric-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

import type { Logger } from "winston";
import type { ProgressMetricService } from "./progress-metric.service.mjs";

const tMetricTypeUnion = t.Union([
  t.Literal("weight_lbs"),
  t.Literal("body_fat_pct"),
  t.Literal("resting_heart_rate"),
  t.Literal("custom"),
]);

const tProgressMetricBody = t.Object({
  metricType: tMetricTypeUnion,
  value: t.Number(),
  unit: t.String({ minLength: 1, maxLength: 50 }),
  date: t.String(),
  customMetricName: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  notes: t.Optional(t.String({ maxLength: 2000 })),
  userId: t.Optional(t.String()),
});

const tUpdateProgressMetricBody = t.Object({
  metricType: t.Optional(tMetricTypeUnion),
  value: t.Optional(t.Number()),
  unit: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  date: t.Optional(t.String()),
  customMetricName: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  notes: t.Optional(t.String({ maxLength: 2000 })),
});

const tProgressMetricData = t.Object({
  id: t.String(),
  metricType: t.String(),
  value: t.Number(),
  unit: t.String(),
  date: t.String(),
  customMetricName: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
});

const tErrorResponse = t.Object({ success: t.Boolean(), error: t.String() });

const tProgressMetricListQuery = t.Object({
  metricType: t.Optional(t.Union([
    t.Literal("weight_lbs"),
    t.Literal("body_fat_pct"),
    t.Literal("resting_heart_rate"),
    t.Literal("custom"),
  ])),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

const tByTypeQuery = t.Object({
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createProgressMetricRouter = (loggerInstance: Logger, service: ProgressMetricService) => {
  return new Elysia({ prefix: "/progress-metrics" })
    .onError({ as: "local" }, ({ code, set }) => {
      if (code === "VALIDATION") {
        set.status = 400;
        return { success: false, error: "Validation error" };
      }
    })
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
        body: tProgressMetricBody,
        response: {
          201: t.Object({ success: t.Boolean(), data: tProgressMetricData }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Progress Metrics"], summary: "Create progress metric" },
      }
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
        query: tProgressMetricListQuery,
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tProgressMetricData), count: t.Number() }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Progress Metrics"], summary: "List progress metrics" },
      }
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
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tProgressMetricData), count: t.Number() }),
          500: tErrorResponse,
        },
        detail: { tags: ["Progress Metrics"], summary: "Get latest metric of each type" },
      }
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
          (query as { endDate?: string }).endDate
        );
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value, count: result.value.length };
      },
      {
        query: tByTypeQuery,
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tProgressMetricData), count: t.Number() }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Progress Metrics"], summary: "Get metrics by type" },
      }
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
        response: {
          200: t.Object({ success: t.Boolean(), data: tProgressMetricData }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Progress Metrics"], summary: "Get progress metric by ID" },
      }
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
        body: tUpdateProgressMetricBody,
        response: {
          200: t.Object({ success: t.Boolean(), data: tProgressMetricData }),
          400: tErrorResponse,
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Progress Metrics"], summary: "Update progress metric" },
      }
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
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Object({ deleted: t.Boolean() }) }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Progress Metrics"], summary: "Delete progress metric" },
      }
    );
};
