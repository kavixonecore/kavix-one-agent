import { z } from "zod";

import { MetricType } from "../progress-metric.constants.mjs";

export const createProgressMetricSchema = z.object({
  metricType: z.enum(Object.values(MetricType) as [string, ...string[]]),
  value: z.number(),
  unit: z.string()
.min(1)
.max(50),
  date: z.string(),
  customMetricName: z.string()
.min(1)
.max(200)
.optional(),
  notes: z.string()
.max(2000)
.optional(),
  userId: z.string()
.optional(),
})
.refine(
  (data) => data.metricType !== MetricType.CUSTOM || !!data.customMetricName,
  {
    message: "customMetricName is required when metricType is 'custom'",
    path: ["customMetricName"],
  },
);
