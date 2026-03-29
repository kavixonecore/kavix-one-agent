import { Elysia, t } from "elysia";
import type { WorkoutExerciseService } from "./workout-exercise.service.mjs";
import type { Logger } from "winston";
import { createWorkoutExerciseSchema } from "./schemas/create-workout-exercise.schema.mjs";
import { updateWorkoutExerciseSchema } from "./schemas/update-workout-exercise.schema.mjs";
import { workoutExerciseQuerySchema } from "./schemas/workout-exercise-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createWorkoutExerciseRouter = (loggerInstance: Logger, service: WorkoutExerciseService) => {
  return new Elysia({ prefix: "/workout-exercises" })
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
        body: t.Unknown(),
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
        body: t.Unknown(),
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
        detail: { tags: ["Workout Exercises"], summary: "Delete workout exercise" },
      },
    );
};
