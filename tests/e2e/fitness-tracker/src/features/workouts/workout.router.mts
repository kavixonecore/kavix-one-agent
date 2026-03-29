import { Elysia, t } from "elysia";
import type { WorkoutService } from "./workout.service.mjs";
import type { Logger } from "winston";
import { createWorkoutSchema } from "./schemas/create-workout.schema.mjs";
import { updateWorkoutSchema } from "./schemas/update-workout.schema.mjs";
import { workoutQuerySchema } from "./schemas/workout-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createWorkoutRouter = (loggerInstance: Logger, service: WorkoutService) => {
  return new Elysia({ prefix: "/workouts" })
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
        body: t.Unknown(),
        detail: { tags: ["Workouts"], summary: "Create workout" },
      },
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
        detail: { tags: ["Workouts"], summary: "List workouts with optional date range filter" },
      },
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
        detail: { tags: ["Workouts"], summary: "Get workout by ID" },
      },
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
        body: t.Unknown(),
        detail: { tags: ["Workouts"], summary: "Update workout" },
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
        detail: { tags: ["Workouts"], summary: "Delete workout" },
      },
    );
};
