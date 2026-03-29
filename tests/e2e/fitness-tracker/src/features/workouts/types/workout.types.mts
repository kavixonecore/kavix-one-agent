import type { z } from "zod";
import type { createWorkoutSchema } from "../schemas/create-workout.schema.mjs";
import type { updateWorkoutSchema } from "../schemas/update-workout.schema.mjs";
import type { workoutQuerySchema, workoutParamsSchema } from "../schemas/workout-query.schema.mjs";

export type CreateWorkout = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkout = z.infer<typeof updateWorkoutSchema>;
export type WorkoutQuery = z.infer<typeof workoutQuerySchema>;
export type WorkoutParams = z.infer<typeof workoutParamsSchema>;
