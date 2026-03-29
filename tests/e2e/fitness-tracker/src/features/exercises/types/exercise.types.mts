import type { z } from "zod";
import type { createExerciseSchema } from "../schemas/create-exercise.schema.mjs";
import type { updateExerciseSchema } from "../schemas/update-exercise.schema.mjs";
import type { exerciseQuerySchema, exerciseParamsSchema } from "../schemas/exercise-query.schema.mjs";

export type CreateExercise = z.infer<typeof createExerciseSchema>;
export type UpdateExercise = z.infer<typeof updateExerciseSchema>;
export type ExerciseQuery = z.infer<typeof exerciseQuerySchema>;
export type ExerciseParams = z.infer<typeof exerciseParamsSchema>;
