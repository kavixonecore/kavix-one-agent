import type { IBaseEntity } from "./base-entity.interface";

export interface IWorkoutExercise extends IBaseEntity {
  readonly workoutId: string;
  readonly exerciseId: string;
  readonly order: number;
  readonly sets?: number;
  readonly reps?: number;
  readonly weightLbs?: number;
  readonly durationSeconds?: number;
  readonly restSeconds?: number;
  readonly notes?: string;
}

export interface ICreateWorkoutExercise {
  readonly workoutId: string;
  readonly exerciseId: string;
  readonly order: number;
  readonly sets?: number;
  readonly reps?: number;
  readonly weightLbs?: number;
  readonly durationSeconds?: number;
  readonly restSeconds?: number;
  readonly notes?: string;
}
