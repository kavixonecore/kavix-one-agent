import { z } from "zod";

export const createWorkoutExerciseSchema = z.object({
  workoutId: z.string()
.min(1),
  exerciseId: z.string()
.min(1),
  order: z.number()
.int()
.positive(),
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
  userId: z.string()
.optional(),
});
