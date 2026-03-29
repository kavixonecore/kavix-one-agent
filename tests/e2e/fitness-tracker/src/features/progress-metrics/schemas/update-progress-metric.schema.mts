import { z } from "zod";
import { MetricType } from "../progress-metric.constants.mjs";

export const updateProgressMetricSchema = z.object({
  metricType: z.enum(Object.values(MetricType) as [string, ...string[]]).optional(),
  value: z.number().optional(),
  unit: z.string().min(1).max(50).optional(),
  date: z.string().optional(),
  customMetricName: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).optional(),
});
