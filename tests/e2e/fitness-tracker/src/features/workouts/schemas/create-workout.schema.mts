import { z } from "zod";
import { WorkoutType, WorkoutStatus } from "../workout.constants.mjs";

export const createWorkoutSchema = z.object({
  name: z.string().min(1).max(200),
  workoutType: z.enum(Object.values(WorkoutType) as [string, ...string[]]),
  status: z.enum(Object.values(WorkoutStatus) as [string, ...string[]]).default(WorkoutStatus.PLANNED),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  durationMinutes: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
  userId: z.string().optional(),
});
