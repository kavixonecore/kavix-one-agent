export const MuscleGroup = {
  CHEST: "chest",
  BACK: "back",
  LEGS: "legs",
  SHOULDERS: "shoulders",
  ARMS: "arms",
  CORE: "core",
  FULL_BODY: "full_body",
} as const;

export type MuscleGroupValue = (typeof MuscleGroup)[keyof typeof MuscleGroup];

export const DifficultyLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type DifficultyLevelValue = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];
