import { ulid } from "ulidx";

import { ok, err } from "../../shared/types/index.mjs";
import { NotFoundError, ValidationError } from "../../shared/errors/index.mjs";
import { MetricType } from "./progress-metric.constants.mjs";

import type { IProgressMetric } from "./interfaces/index.mjs";
import type { CreateProgressMetric, UpdateProgressMetric, ProgressMetricQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import type { AppError } from "../../shared/errors/index.mjs";
import type { ProgressMetricRepository } from "./progress-metric.repository.mjs";
import type { MetricTypeValue } from "./progress-metric.constants.mjs";

export interface IProgressMetricListResult {
  data: IProgressMetric[];
  count: number;
}

export class ProgressMetricService {

  private readonly repository: ProgressMetricRepository;

  public constructor(repository: ProgressMetricRepository) {
    this.repository = repository;
  }

  public async create(data: CreateProgressMetric): Promise<Result<IProgressMetric, AppError>> {
    if (data.metricType === MetricType.CUSTOM && !data.customMetricName) {
      return err(new ValidationError("customMetricName is required when metricType is 'custom'"));
    }

    const now = new Date()
.toISOString();
    const metric: IProgressMetric = {
      id: ulid(),
      metricType: data.metricType as MetricTypeValue,
      value: data.value,
      unit: data.unit,
      date: data.date,
      ...(data.customMetricName !== undefined && { customMetricName: data.customMetricName }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.userId !== undefined && { userId: data.userId }),
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(metric);
  }

  public async findAll(query: ProgressMetricQuery): Promise<Result<IProgressMetricListResult, AppError>> {
    const [dataResult, countResult] = await Promise.all([
      this.repository.findAll(query),
      this.repository.count({
        metricType: query.metricType,
        startDate: query.startDate,
        endDate: query.endDate,
      }),
    ]);

    if (!dataResult.ok) {
      return err(dataResult.error);
    }
    if (!countResult.ok) {
      return err(countResult.error);
    }

    return ok({ data: dataResult.value, count: countResult.value });
  }

  public async findById(id: string): Promise<Result<IProgressMetric, AppError>> {
    const result = await this.repository.findById(id);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("ProgressMetric", id));
    }
    return ok(result.value);
  }

  public async findByMetricType(
    metricType: string,
    startDate?: string,
    endDate?: string
  ): Promise<Result<IProgressMetric[], AppError>> {
    return this.repository.findByMetricType(metricType as MetricTypeValue, startDate, endDate);
  }

  public async getLatest(): Promise<Result<IProgressMetric[], AppError>> {
    return this.repository.getLatest();
  }

  public async update(id: string, data: UpdateProgressMetric): Promise<Result<IProgressMetric, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("ProgressMetric", id));
    }

    const result = await this.repository.update(id, data);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("ProgressMetric", id));
    }
    return ok(result.value);
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("ProgressMetric", id));
    }

    return this.repository.delete(id);
  }
}
