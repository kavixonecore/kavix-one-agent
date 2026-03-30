import type { IBaseEntity } from "./base-entity.interface";
import type { MetricTypeValue } from "./enums";

export interface IProgressMetric extends IBaseEntity {
  readonly metricType: MetricTypeValue;
  readonly value: number;
  readonly unit: string;
  readonly date: string;
  readonly customMetricName?: string;
  readonly notes?: string;
}

export interface ICreateProgressMetric {
  readonly metricType: MetricTypeValue;
  readonly value: number;
  readonly unit: string;
  readonly date: string;
  readonly customMetricName?: string;
  readonly notes?: string;
}

export interface IProgressMetricQuery {
  readonly metricType?: MetricTypeValue;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly page?: number;
  readonly limit?: number;
}
