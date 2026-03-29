import { Elysia, t } from "elysia";

import { createWorkoutSchema } from "./schemas/create-workout.schema.mjs";
import { updateWorkoutSchema } from "./schemas/update-workout.schema.mjs";
import { workoutQuerySchema } from "./schemas/workout-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

import type { Logger } from "winston";
import type { WorkoutService } from "./workout.service.mjs";

const tWorkoutTypeUnion = t.Union([
  t.Literal("running"),
  t.Literal("weightlifting"),
  t.Literal("cycling"),
  t.Literal("swimming"),
  t.Literal("other"),
]);

const tWorkoutStatusUnion = t.Union([
  t.Literal("planned"),
  t.Literal("completed"),
  t.Literal("skipped"),
]);

const tWorkoutBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 200 }),
  workoutType: tWorkoutTypeUnion,
  status: t.Optional(tWorkoutStatusUnion),
  date: t.String(),
  durationMinutes: t.Optional(t.Number()),
  notes: t.Optional(t.String({ maxLength: 2000 })),
  userId: t.Optional(t.String()),
});

const tUpdateWorkoutBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  workoutType: t.Optional(tWorkoutTypeUnion),
  status: t.Optional(tWorkoutStatusUnion),
  date: t.Optional(t.String()),
  durationMinutes: t.Optional(t.Number()),
  notes: t.Optional(t.String({ maxLength: 2000 })),
});

const tWorkoutData = t.Object({
  id: t.String(),
  name: t.String(),
  workoutType: t.String(),
  status: t.String(),
  date: t.String(),
  durationMinutes: t.Optional(t.Number()),
  notes: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
});

const tErrorResponse = t.Object({ success: t.Boolean(), error: t.String() });

const tWorkoutListQuery = t.Object({
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  status: t.Optional(t.Union([
    t.Literal("planned"),
    t.Literal("completed"),
    t.Literal("skipped"),
  ])),
  workoutType: t.Optional(t.Union([
    t.Literal("running"),
    t.Literal("weightlifting"),
    t.Literal("cycling"),
    t.Literal("swimming"),
    t.Literal("other"),
  ])),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createWorkoutRouter = (loggerInstance: Logger, service: WorkoutService) => {
  return new Elysia({ prefix: "/workouts" })
    .onError({ as: "local" }, ({ code, set }) => {
      if (code === "VALIDATION") {
        set.status = 400;
        return { success: false, error: "Validation error" };
      }
    })
    .post(
      "/",
      async ({ body, set }) => {
        const parsed = createWorkoutSchema.safeParse(body);
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
        body: tWorkoutBody,
        response: {
          201: t.Object({ success: t.Boolean(), data: tWorkoutData }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workouts"], summary: "Create workout" },
      }
    )
    .get(
      "/",
      async ({ query, set }) => {
        const parsed = workoutQuerySchema.safeParse(query);
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
        query: tWorkoutListQuery,
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tWorkoutData), count: t.Number() }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workouts"], summary: "List workouts with optional date range filter" },
      }
    )
    .get(
      "/:id",
      async ({ params, set }) => {
        loggerInstance.debug("Getting workout by id", { id: params["id"] });
        const result = await service.findById(params["id"] ?? "");
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value };
      },
      {
        response: {
          200: t.Object({ success: t.Boolean(), data: tWorkoutData }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workouts"], summary: "Get workout by ID" },
      }
    )
    .put(
      "/:id",
      async ({ params, body, set }) => {
        const parsed = updateWorkoutSchema.safeParse(body);
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
        body: tUpdateWorkoutBody,
        response: {
          200: t.Object({ success: t.Boolean(), data: tWorkoutData }),
          400: tErrorResponse,
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workouts"], summary: "Update workout" },
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
        detail: { tags: ["Workouts"], summary: "Delete workout" },
      }
    );
};
