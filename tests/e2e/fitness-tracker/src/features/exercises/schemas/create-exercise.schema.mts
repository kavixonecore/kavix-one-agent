import { z } from "zod";
import { MuscleGroup, DifficultyLevel } from "../exercise.constants.mjs";

export const createExerciseSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  muscleGroup: z.enum(Object.values(MuscleGroup) as [string, ...string[]]),
  difficultyLevel: z.enum(Object.values(DifficultyLevel) as [string, ...string[]]),
  equipmentRequired: z.array(z.string()).default([]),
  instructions: z.string().min(1).max(5000),
  userId: z.string().optional(),
});
