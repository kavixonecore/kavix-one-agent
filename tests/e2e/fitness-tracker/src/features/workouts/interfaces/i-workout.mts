import type { IBaseEntity } from "../../../shared/interfaces/index.mjs";
import type { WorkoutTypeValue, WorkoutStatusValue } from "../workout.constants.mjs";

export interface IWorkout extends IBaseEntity {
  name: string;
  workoutType: WorkoutTypeValue;
  status: WorkoutStatusValue;
  date: string;
  durationMinutes?: number;
  notes?: string;
  userId?: string;
}
