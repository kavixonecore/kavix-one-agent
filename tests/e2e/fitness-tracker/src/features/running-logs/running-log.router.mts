import { Elysia, t } from "elysia";
import type { RunningLogService } from "./running-log.service.mjs";
import type { Logger } from "winston";
import { createRunningLogSchema } from "./schemas/create-running-log.schema.mjs";
import { updateRunningLogSchema } from "./schemas/update-running-log.schema.mjs";
import { runningLogQuerySchema } from "./schemas/running-log-query.schema.mjs";
import { AppError } from "../../shared/errors/index.mjs";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createRunningLogRouter = (loggerInstance: Logger, service: RunningLogService) => {
  return new Elysia({ prefix: "/running-logs" })
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
        body: t.Unknown(),
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
        body: t.Unknown(),
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
        detail: { tags: ["Running Logs"], summary: "Delete running log" },
      },
    );
};
