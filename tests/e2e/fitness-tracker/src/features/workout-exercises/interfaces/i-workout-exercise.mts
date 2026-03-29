import type { IBaseEntity } from "../../../shared/interfaces/index.mjs";

export interface IWorkoutExercise extends IBaseEntity {
  workoutId: string;
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: number;
  weightLbs?: number;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
  userId?: string;
}
