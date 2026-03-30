export type { IBaseEntity } from "./base-entity.interface";
export type {
  IExercise,
  ICreateExercise,
  IExerciseQuery,
} from "./exercise.interface";
export type {
  IWorkout,
  ICreateWorkout,
  IWorkoutQuery,
} from "./workout.interface";
export type {
  IProgressMetric,
  ICreateProgressMetric,
  IProgressMetricQuery,
} from "./progress-metric.interface";
export type {
  IRunningLog,
  ICreateRunningLog,
  IRunningLogQuery,
  IPersonalBests,
} from "./running-log.interface";
export type {
  IWorkoutExercise,
  ICreateWorkoutExercise,
} from "./workout-exercise.interface";
export {
  MuscleGroup,
  DifficultyLevel,
  WorkoutType,
  WorkoutStatus,
  MetricType,
} from "./enums";
export type {
  MuscleGroupValue,
  DifficultyLevelValue,
  WorkoutTypeValue,
  WorkoutStatusValue,
  MetricTypeValue,
} from "./enums";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}
