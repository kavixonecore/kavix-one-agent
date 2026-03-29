import { z } from "zod";

import { WorkoutType, WorkoutStatus } from "../workout.constants.mjs";

export const updateWorkoutSchema = z.object({
  name: z.string()
.min(1)
.max(200)
.optional(),
  workoutType: z.enum(Object.values(WorkoutType) as [string, ...string[]])
.optional(),
  status: z.enum(Object.values(WorkoutStatus) as [string, ...string[]])
.optional(),
  date: z.string()
.datetime({ offset: true })
.or(z.string()
.regex(/^\d{4}-\d{2}-\d{2}$/))
.optional(),
  durationMinutes: z.number()
.positive()
.optional(),
  notes: z.string()
.max(2000)
.optional(),
});
