import { z } from "zod";

import { WorkoutStatus, WorkoutType } from "../workout.constants.mjs";

export const workoutQuerySchema = z.object({
  startDate: z.string()
.optional(),
  endDate: z.string()
.optional(),
  status: z.enum(Object.values(WorkoutStatus) as [string, ...string[]])
.optional(),
  workoutType: z.enum(Object.values(WorkoutType) as [string, ...string[]])
.optional(),
  page: z.coerce.number()
.int()
.positive()
.default(1),
  limit: z.coerce.number()
.int()
.positive()
.max(100)
.default(20),
});

export const workoutParamsSchema = z.object({
  id: z.string()
.min(1),
});
