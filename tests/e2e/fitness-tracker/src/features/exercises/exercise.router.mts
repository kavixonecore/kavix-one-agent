import { Elysia, t } from "elysia";

import { createExerciseSchema } from "./schemas/create-exercise.schema.mjs";
import { updateExerciseSchema } from "./schemas/update-exercise.schema.mjs";
import { exerciseQuerySchema } from "./schemas/exercise-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

import type { Logger } from "winston";
import type { ExerciseService } from "./exercise.service.mjs";

const tExerciseBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 200 }),
  description: t.String({ minLength: 1, maxLength: 1000 }),
  muscleGroup: t.Union([
    t.Literal("chest"),
    t.Literal("back"),
    t.Literal("legs"),
    t.Literal("shoulders"),
    t.Literal("arms"),
    t.Literal("core"),
    t.Literal("full_body"),
  ]),
  difficultyLevel: t.Union([
    t.Literal("beginner"),
    t.Literal("intermediate"),
    t.Literal("advanced"),
  ]),
  equipmentRequired: t.Optional(t.Array(t.String())),
  instructions: t.String({ minLength: 1, maxLength: 5000 }),
  userId: t.Optional(t.String()),
});

const tUpdateExerciseBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  description: t.Optional(t.String({ minLength: 1, maxLength: 1000 })),
  muscleGroup: t.Optional(t.Union([
    t.Literal("chest"),
    t.Literal("back"),
    t.Literal("legs"),
    t.Literal("shoulders"),
    t.Literal("arms"),
    t.Literal("core"),
    t.Literal("full_body"),
  ])),
  difficultyLevel: t.Optional(t.Union([
    t.Literal("beginner"),
    t.Literal("intermediate"),
    t.Literal("advanced"),
  ])),
  equipmentRequired: t.Optional(t.Array(t.String())),
  instructions: t.Optional(t.String({ minLength: 1, maxLength: 5000 })),
});

const tExerciseData = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  muscleGroup: t.String(),
  difficultyLevel: t.String(),
  equipmentRequired: t.Array(t.String()),
  instructions: t.String(),
  userId: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
});

const tErrorResponse = t.Object({ success: t.Boolean(), error: t.String() });

const tExerciseListQuery = t.Object({
  muscleGroup: t.Optional(t.Union([
    t.Literal("chest"),
    t.Literal("back"),
    t.Literal("legs"),
    t.Literal("shoulders"),
    t.Literal("arms"),
    t.Literal("core"),
    t.Literal("full_body"),
  ])),
  name: t.Optional(t.String()),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createExerciseRouter = (loggerInstance: Logger, service: ExerciseService) => {
  return new Elysia({ prefix: "/exercises" })
    .onError({ as: "local" }, ({ code, set }) => {
      if (code === "VALIDATION") {
        set.status = 400;
        return { success: false, error: "Validation error" };
      }
    })
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
        body: tExerciseBody,
        response: {
          201: t.Object({ success: t.Boolean(), data: tExerciseData }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
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
        query: tExerciseListQuery,
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Array(tExerciseData), count: t.Number() }),
          400: tErrorResponse,
          500: tErrorResponse,
        },
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
        response: {
          200: t.Object({ success: t.Boolean(), data: tExerciseData }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
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
        body: tUpdateExerciseBody,
        response: {
          200: t.Object({ success: t.Boolean(), data: tExerciseData }),
          400: tErrorResponse,
          404: tErrorResponse,
          500: tErrorResponse,
        },
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
        response: {
          200: t.Object({ success: t.Boolean(), data: t.Object({ deleted: t.Boolean() }) }),
          404: tErrorResponse,
          500: tErrorResponse,
        },
        detail: { tags: ["Exercises"], summary: "Delete exercise" },
      },
    );
};
