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
