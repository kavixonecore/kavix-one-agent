import { z } from "zod";

export const updateWorkoutExerciseSchema = z.object({
  order: z.number()
.int()
.positive()
.optional(),
  sets: z.number()
.int()
.positive()
.optional(),
  reps: z.number()
.int()
.positive()
.optional(),
  weightLbs: z.number()
.positive()
.optional(),
  durationSeconds: z.number()
.positive()
.optional(),
  restSeconds: z.number()
.positive()
.optional(),
  notes: z.string()
.max(2000)
.optional(),
});
