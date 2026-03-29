import { z } from "zod";
import { MetricType } from "../progress-metric.constants.mjs";

export const progressMetricQuerySchema = z.object({
  metricType: z.enum(Object.values(MetricType) as [string, ...string[]]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const progressMetricParamsSchema = z.object({
  id: z.string().min(1),
});

export const metricTypeParamsSchema = z.object({
  metricType: z.enum(Object.values(MetricType) as [string, ...string[]]),
});
