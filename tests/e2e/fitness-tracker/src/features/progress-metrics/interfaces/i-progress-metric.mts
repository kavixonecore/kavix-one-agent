import type { IBaseEntity } from "../../../shared/interfaces/index.mjs";
import type { MetricTypeValue } from "../progress-metric.constants.mjs";

export interface IProgressMetric extends IBaseEntity {
  metricType: MetricTypeValue;
  value: number;
  unit: string;
  date: string;
  customMetricName?: string;
  notes?: string;
  userId?: string;
}
