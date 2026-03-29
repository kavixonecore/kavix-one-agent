import type { z } from "zod";
import type { createRunningLogSchema } from "../schemas/create-running-log.schema.mjs";
import type { updateRunningLogSchema } from "../schemas/update-running-log.schema.mjs";
import type { runningLogQuerySchema } from "../schemas/running-log-query.schema.mjs";

export type CreateRunningLog = z.infer<typeof createRunningLogSchema>;
export type UpdateRunningLog = z.infer<typeof updateRunningLogSchema>;
export type RunningLogQuery = z.infer<typeof runningLogQuerySchema>;

export interface IPersonalBests {
  fastestPace: number | null;
  longestDistance: number | null;
  longestDuration: number | null;
}
