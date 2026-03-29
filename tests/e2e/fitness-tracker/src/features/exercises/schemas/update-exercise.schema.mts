import { z } from "zod";
import { MuscleGroup, DifficultyLevel } from "../exercise.constants.mjs";

export const updateExerciseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  muscleGroup: z.enum(Object.values(MuscleGroup) as [string, ...string[]]).optional(),
  difficultyLevel: z.enum(Object.values(DifficultyLevel) as [string, ...string[]]).optional(),
  equipmentRequired: z.array(z.string()).optional(),
  instructions: z.string().min(1).max(5000).optional(),
});
