import type { z } from "zod";
import type { createProgressMetricSchema } from "../schemas/create-progress-metric.schema.mjs";
import type { updateProgressMetricSchema } from "../schemas/update-progress-metric.schema.mjs";
import type { progressMetricQuerySchema } from "../schemas/progress-metric-query.schema.mjs";

export type CreateProgressMetric = z.infer<typeof createProgressMetricSchema>;
export type UpdateProgressMetric = z.infer<typeof updateProgressMetricSchema>;
export type ProgressMetricQuery = z.infer<typeof progressMetricQuerySchema>;
