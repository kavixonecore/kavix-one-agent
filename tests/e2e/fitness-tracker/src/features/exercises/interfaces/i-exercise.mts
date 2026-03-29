import type { IBaseEntity } from "../../../shared/interfaces/index.mjs";
import type { MuscleGroupValue, DifficultyLevelValue } from "../exercise.constants.mjs";

export interface IExercise extends IBaseEntity {
  name: string;
  description: string;
  muscleGroup: MuscleGroupValue;
  difficultyLevel: DifficultyLevelValue;
  equipmentRequired: string[];
  instructions: string;
  userId?: string;
}
