import { Elysia, t } from "elysia";
import type { ExerciseService } from "./exercise.service.mjs";
import type { Logger } from "winston";
import { createExerciseSchema } from "./schemas/create-exercise.schema.mjs";
import { updateExerciseSchema } from "./schemas/update-exercise.schema.mjs";
import { exerciseQuerySchema } from "./schemas/exercise-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createExerciseRouter = (loggerInstance: Logger, service: ExerciseService) => {
  return new Elysia({ prefix: "/exercises" })
    .post(
      "/",
      async ({ body, set }) => {
        const parsed = createExerciseSchema.safeParse(body);
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
        detail: { tags: ["Exercises"], summary: "Create exercise" },
      },
    )
    .get(
      "/",
      async ({ query, set }) => {
        const parsed = exerciseQuerySchema.safeParse(query);
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
        detail: { tags: ["Exercises"], summary: "List exercises" },
      },
    )
    .get(
      "/:id",
      async ({ params, set }) => {
        loggerInstance.debug("Getting exercise by id", { id: params["id"] });
        const result = await service.findById(params["id"] ?? "");
        if (!result.ok) {
          set.status = result.error instanceof AppError ? result.error.statusCode : 500;
          return { success: false, error: result.error.message };
        }
        return { success: true, data: result.value };
      },
      {
        detail: { tags: ["Exercises"], summary: "Get exercise by ID" },
      },
    )
    .put(
      "/:id",
      async ({ params, body, set }) => {
        const parsed = updateExerciseSchema.safeParse(body);
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
        detail: { tags: ["Exercises"], summary: "Update exercise" },
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
        detail: { tags: ["Exercises"], summary: "Delete exercise" },
      },
    );
};
