import type { IBaseEntity } from "./base-entity.interface";
import type { DifficultyLevelValue, MuscleGroupValue } from "./enums";

export interface IExercise extends IBaseEntity {
  readonly name: string;
  readonly description: string;
  readonly muscleGroup: MuscleGroupValue;
  readonly difficultyLevel: DifficultyLevelValue;
  readonly equipmentRequired: string[];
  readonly instructions: string;
}

export interface ICreateExercise {
  readonly name: string;
  readonly description: string;
  readonly muscleGroup: MuscleGroupValue;
  readonly difficultyLevel: DifficultyLevelValue;
  readonly equipmentRequired: string[];
  readonly instructions: string;
}

export interface IExerciseQuery {
  readonly muscleGroup?: MuscleGroupValue;
  readonly name?: string;
  readonly page?: number;
  readonly limit?: number;
}
