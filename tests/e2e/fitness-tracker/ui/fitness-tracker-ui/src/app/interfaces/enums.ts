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

export const WorkoutType = {
  RUNNING: "running",
  WEIGHTLIFTING: "weightlifting",
  CYCLING: "cycling",
  SWIMMING: "swimming",
  OTHER: "other",
} as const;

export type WorkoutTypeValue = (typeof WorkoutType)[keyof typeof WorkoutType];

export const WorkoutStatus = {
  PLANNED: "planned",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;

export type WorkoutStatusValue = (typeof WorkoutStatus)[keyof typeof WorkoutStatus];

export const MetricType = {
  WEIGHT_LBS: "weight_lbs",
  BODY_FAT_PCT: "body_fat_pct",
  RESTING_HEART_RATE: "resting_heart_rate",
  CUSTOM: "custom",
} as const;

export type MetricTypeValue = (typeof MetricType)[keyof typeof MetricType];
