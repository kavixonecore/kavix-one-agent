import { Elysia, t } from "elysia";
import type { WorkoutExerciseService } from "./workout-exercise.service.mjs";
import type { Logger } from "winston";
import { createWorkoutExerciseSchema } from "./schemas/create-workout-exercise.schema.mjs";
import { updateWorkoutExerciseSchema } from "./schemas/update-workout-exercise.schema.mjs";
import { workoutExerciseQuerySchema } from "./schemas/workout-exercise-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

const tWorkoutExerciseBody = t.Object({
  workoutId: t.String({ minLength: 1 }),
  exerciseId: t.String({ minLength: 1 }),
  order: t.Number(),
  sets: t.Optional(t.Number()),
  reps: t.Optional(t.Number()),
  weightLbs: t.Optional(t.Number()),
  durationSeconds: t.Optional(t.Number()),
  restSeconds: t.Optional(t.Number()),
  notes: t.Optional(t.String({ maxLength: 2000 })),
  userId: t.Optional(t.String()),
});

const tUpdateWorkoutExerciseBody = t.Object({
  order: t.Optional(t.Number()),
  sets: t.Optional(t.Number()),
  reps: t.Optional(t.Number()),
  weightLbs: t.Optional(t.Number()),
  durationSeconds: t.Optional(t.Number()),
  restSeconds: t.Optional(t.Number()),
  notes: t.Optional(t.String({ maxLength: 2000 })),
});

const tWorkoutExerciseData = t.Object({
  id: t.String(),
  workoutId: t.String(),
  exerciseId: t.String(),
  order: t.Number(),
  sets: t.Optional(t.Number()),
  reps: t.Optional(t.Number()),
  weightLbs: t.Optional(t.Number()),
  durationSeconds: t.Optional(t.Number()),
  restSeconds: t.Optional(t.Number()),
  notes: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
});

const tErrorResponse = t.Object({ success: t.Boolean(), error: t.String() });

const tWorkoutExerciseListQuery = t.Object({
  workoutId: t.Optional(t.String()),
  exerciseId: t.Optional(t.String()),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createWorkoutExerciseRouter = (loggerInstance: Logger, service: WorkoutExerciseService) => {
  return new Elysia({ prefix: "/workout-exercises" })
    .onError({ as: "local" }, ({ code, set }) => {
      if (code === "VALIDATION") {
        set.status = 400;
        return { success: false, error: "Validation error" };
      }
    })
    .post(
      "/",
      async ({ body, set }) => {
        const parsed = createWorkoutExerciseSchema.safeParse(body);
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
        body: tWorkoutExerciseBody,
        response: {
          201: t.Object({ success: t.Boolean(), data: tWorkoutExerciseData }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workout Exercises"], summary: "Create workout exercise" },
      },
    )
    .get(
      "/",
      async ({ query, set }) => {
        const parsed = workoutExerciseQuerySchema.safeParse(query);
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
        query: tWorkoutExerciseListQuery,
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tWorkoutExerciseData), count: t.Number() }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workout Exercises"], summary: "List workout exercises" },
      },
    )
    .get(
      "/workout/:workoutId",
      async ({ params, set }) => {
        loggerInstance.debug("Getting workout exercises by workoutId", { workoutId: params["workoutId"] });
        const result = await service.findByWorkoutId(params["workoutId"] ?? "");
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value, count: result.value.length };
      },
      {
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tWorkoutExerciseData), count: t.Number() }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workout Exercises"], summary: "Get exercises for a workout" },
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
          200: t.Object({ success: t.Boolean(), data: tWorkoutExerciseData }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workout Exercises"], summary: "Get workout exercise by ID" },
      },
    )
    .put(
      "/:id",
      async ({ params, body, set }) => {
        const parsed = updateWorkoutExerciseSchema.safeParse(body);
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
        body: tUpdateWorkoutExerciseBody,
        response: {
          200: t.Object({ success: t.Boolean(), data: tWorkoutExerciseData }),
          400: tErrorResponse,
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Workout Exercises"], summary: "Update workout exercise" },
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
        detail: { tags: ["Workout Exercises"], summary: "Delete workout exercise" },
      },
    );
};
