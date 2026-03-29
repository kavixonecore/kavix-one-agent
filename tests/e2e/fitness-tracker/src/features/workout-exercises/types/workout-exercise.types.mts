import type { z } from "zod";
import type { createWorkoutExerciseSchema } from "../schemas/create-workout-exercise.schema.mjs";
import type { updateWorkoutExerciseSchema } from "../schemas/update-workout-exercise.schema.mjs";
import type { workoutExerciseQuerySchema } from "../schemas/workout-exercise-query.schema.mjs";

export type CreateWorkoutExercise = z.infer<typeof createWorkoutExerciseSchema>;
export type UpdateWorkoutExercise = z.infer<typeof updateWorkoutExerciseSchema>;
export type WorkoutExerciseQuery = z.infer<typeof workoutExerciseQuerySchema>;
