import type { IBaseEntity } from "./base-entity.interface";
import type { WorkoutStatusValue, WorkoutTypeValue } from "./enums";

export interface IWorkout extends IBaseEntity {
  readonly name: string;
  readonly workoutType: WorkoutTypeValue;
  readonly status: WorkoutStatusValue;
  readonly date: string;
  readonly durationMinutes?: number;
  readonly notes?: string;
}

export interface ICreateWorkout {
  readonly name: string;
  readonly workoutType: WorkoutTypeValue;
  readonly status?: WorkoutStatusValue;
  readonly date: string;
  readonly durationMinutes?: number;
  readonly notes?: string;
}

export interface IWorkoutQuery {
  readonly startDate?: string;
  readonly endDate?: string;
  readonly status?: WorkoutStatusValue;
  readonly workoutType?: WorkoutTypeValue;
  readonly page?: number;
  readonly limit?: number;
}
