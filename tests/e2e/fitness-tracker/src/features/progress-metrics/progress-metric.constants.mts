export const MetricType = {
  WEIGHT_LBS: "weight_lbs",
  BODY_FAT_PCT: "body_fat_pct",
  RESTING_HEART_RATE: "resting_heart_rate",
  CUSTOM: "custom",
} as const;

export type MetricTypeValue = (typeof MetricType)[keyof typeof MetricType];
