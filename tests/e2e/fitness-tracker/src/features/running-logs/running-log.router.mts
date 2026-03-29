import { Elysia, t } from "elysia";

import { createRunningLogSchema } from "./schemas/create-running-log.schema.mjs";
import { updateRunningLogSchema } from "./schemas/update-running-log.schema.mjs";
import { runningLogQuerySchema } from "./schemas/running-log-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

import type { Logger } from "winston";
import type { RunningLogService } from "./running-log.service.mjs";

const tRunningLogBody = t.Object({
  workoutId: t.String({ minLength: 1 }),
  distanceMiles: t.Number(),
  durationMinutes: t.Number(),
  paceMinutesPerMile: t.Optional(t.Number()),
  routeName: t.Optional(t.String({ maxLength: 200 })),
  elevationGainFeet: t.Optional(t.Number()),
  heartRateAvg: t.Optional(t.Number()),
  weather: t.Optional(t.String({ maxLength: 100 })),
  notes: t.Optional(t.String({ maxLength: 2000 })),
  userId: t.Optional(t.String()),
});

const tUpdateRunningLogBody = t.Object({
  distanceMiles: t.Optional(t.Number()),
  durationMinutes: t.Optional(t.Number()),
  paceMinutesPerMile: t.Optional(t.Number()),
  routeName: t.Optional(t.String({ maxLength: 200 })),
  elevationGainFeet: t.Optional(t.Number()),
  heartRateAvg: t.Optional(t.Number()),
  weather: t.Optional(t.String({ maxLength: 100 })),
  notes: t.Optional(t.String({ maxLength: 2000 })),
});

const tRunningLogData = t.Object({
  id: t.String(),
  workoutId: t.String(),
  distanceMiles: t.Number(),
  durationMinutes: t.Number(),
  paceMinutesPerMile: t.Number(),
  routeName: t.Optional(t.String()),
  elevationGainFeet: t.Optional(t.Number()),
  heartRateAvg: t.Optional(t.Number()),
  weather: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
});

const tErrorResponse = t.Object({ success: t.Boolean(), error: t.String() });

const tRunningLogListQuery = t.Object({
  workoutId: t.Optional(t.String()),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

const tPersonalBestsData = t.Object({
  fastestPace: t.Union([t.Number(), t.Null()]),
  longestDistance: t.Union([t.Number(), t.Null()]),
  longestDuration: t.Union([t.Number(), t.Null()]),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createRunningLogRouter = (loggerInstance: Logger, service: RunningLogService) => {
  return new Elysia({ prefix: "/running-logs" })
    .onError({ as: "local" }, ({ code, set }) => {
      if (code === "VALIDATION") {
        set.status = 400;
        return { success: false, error: "Validation error" };
      }
    })
    .post(
      "/",
      async ({ body, set }) => {
        const parsed = createRunningLogSchema.safeParse(body);
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
        body: tRunningLogBody,
        response: {
          201: t.Object({ success: t.Boolean(), data: tRunningLogData }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Running Logs"], summary: "Create running log" },
      },
    )
    .get(
      "/",
      async ({ query, set }) => {
        const parsed = runningLogQuerySchema.safeParse(query);
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
        query: tRunningLogListQuery,
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tRunningLogData), count: t.Number() }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Running Logs"], summary: "List running logs" },
      },
    )
    .get(
      "/personal-bests",
      async ({ set }) => {
        loggerInstance.debug("Getting personal bests");
        const result = await service.getPersonalBests();
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value };
      },
      {
        response: {
          200: t.Object({ success: t.Boolean(), data: tPersonalBestsData }),
          500: tErrorResponse,
        },
        detail: { tags: ["Running Logs"], summary: "Get personal bests" },
      },
    )
    .get(
      "/workout/:workoutId",
      async ({ params, set }) => {
        const result = await service.findByWorkoutId(params["workoutId"] ?? "");
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value, count: result.value.length };
      },
      {
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tRunningLogData), count: t.Number() }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Running Logs"], summary: "Get running logs by workout ID" },
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
        response: {
          200: t.Object({ success: t.Boolean(), data: tRunningLogData }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Running Logs"], summary: "Get running log by ID" },
      },
    )
    .put(
      "/:id",
      async ({ params, body, set }) => {
        const parsed = updateRunningLogSchema.safeParse(body);
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
        body: tUpdateRunningLogBody,
        response: {
          200: t.Object({ success: t.Boolean(), data: tRunningLogData }),
          400: tErrorResponse,
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Running Logs"], summary: "Update running log" },
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
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Object({ deleted: t.Boolean() }) }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Running Logs"], summary: "Delete running log" },
      },
    );
};
