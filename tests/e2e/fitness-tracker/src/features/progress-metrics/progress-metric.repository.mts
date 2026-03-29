import type { MongoClient, Collection } from "mongodb";
import type { IProgressMetric } from "./interfaces/index.mjs";
import type { UpdateProgressMetric, ProgressMetricQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import { ok, err } from "../../shared/types/index.mjs";
import { AppError } from "../../shared/errors/index.mjs";
import { logger } from "../../shared/logger.mjs";
import type { MetricTypeValue } from "./progress-metric.constants.mjs";

export class ProgressMetricRepository {

  private readonly collection: Collection<IProgressMetric>;

  public constructor(client: MongoClient, dbName: string) {
    this.collection = client.db(dbName).collection<IProgressMetric>("progress_metrics");
  }

  public async create(metric: IProgressMetric): Promise<Result<IProgressMetric, AppError>> {
    try {
      await this.collection.insertOne(metric);
      return ok(metric);
    } catch (error) {
      logger.error("ProgressMetricRepository.create failed", { error });
      return err(new AppError("Failed to create progress metric", 500, "DB_ERROR"));
    }
  }

  public async findAll(query: ProgressMetricQuery): Promise<Result<IProgressMetric[], AppError>> {
    try {
      const filter: {
        metricType?: MetricTypeValue;
        date?: { $gte?: string; $lte?: string };
      } = {};

      if (query.metricType) filter.metricType = query.metricType as MetricTypeValue;
      if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) filter.date.$gte = query.startDate;
        if (query.endDate) filter.date.$lte = query.endDate;
      }

      const skip = (query.page - 1) * query.limit;
      const docs = await this.collection
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(query.limit)
        .toArray();
      return ok(docs);
    } catch (error) {
      logger.error("ProgressMetricRepository.findAll failed", { error });
      return err(new AppError("Failed to find progress metrics", 500, "DB_ERROR"));
    }
  }

  public async findById(id: string): Promise<Result<IProgressMetric | null, AppError>> {
    try {
      const doc = await this.collection.findOne({ id });
      return ok(doc);
    } catch (error) {
      logger.error("ProgressMetricRepository.findById failed", { error });
      return err(new AppError("Failed to find progress metric", 500, "DB_ERROR"));
    }
  }

  public async findByMetricType(
    metricType: MetricTypeValue,
    startDate?: string,
    endDate?: string,
  ): Promise<Result<IProgressMetric[], AppError>> {
    try {
      const filter: {
        metricType: MetricTypeValue;
        date?: { $gte?: string; $lte?: string };
      } = { metricType };

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = startDate;
        if (endDate) filter.date.$lte = endDate;
      }

      const docs = await this.collection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      return ok(docs);
    } catch (error) {
      logger.error("ProgressMetricRepository.findByMetricType failed", { error });
      return err(new AppError("Failed to find metrics by type", 500, "DB_ERROR"));
    }
  }

  public async getLatest(): Promise<Result<IProgressMetric[], AppError>> {
    try {
      const docs = await this.collection.aggregate<IProgressMetric>([
        { $sort: { date: -1 } },
        {
          $group: {
            _id: "$metricType",
            doc: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$doc" } },
      ]).toArray();
      return ok(docs);
    } catch (error) {
      logger.error("ProgressMetricRepository.getLatest failed", { error });
      return err(new AppError("Failed to get latest metrics", 500, "DB_ERROR"));
    }
  }

  public async update(id: string, data: UpdateProgressMetric): Promise<Result<IProgressMetric | null, AppError>> {
    try {
      const updateData: Partial<IProgressMetric> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.metricType !== undefined) updateData.metricType = data.metricType as MetricTypeValue;
      if (data.value !== undefined) updateData.value = data.value;
      if (data.unit !== undefined) updateData.unit = data.unit;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.customMetricName !== undefined) updateData.customMetricName = data.customMetricName;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const result = await this.collection.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: "after" },
      );
      return ok(result);
    } catch (error) {
      logger.error("ProgressMetricRepository.update failed", { error });
      return err(new AppError("Failed to update progress metric", 500, "DB_ERROR"));
    }
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.collection.deleteOne({ id });
      return ok(result.deletedCount === 1);
    } catch (error) {
      logger.error("ProgressMetricRepository.delete failed", { error });
      return err(new AppError("Failed to delete progress metric", 500, "DB_ERROR"));
    }
  }

  public async count(query: Omit<ProgressMetricQuery, "page" | "limit">): Promise<Result<number, AppError>> {
    try {
      const filter: {
        metricType?: MetricTypeValue;
        date?: { $gte?: string; $lte?: string };
      } = {};

      if (query.metricType) filter.metricType = query.metricType as MetricTypeValue;
      if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) filter.date.$gte = query.startDate;
        if (query.endDate) filter.date.$lte = query.endDate;
      }

      const total = await this.collection.countDocuments(filter);
      return ok(total);
    } catch (error) {
      logger.error("ProgressMetricRepository.count failed", { error });
      return err(new AppError("Failed to count progress metrics", 500, "DB_ERROR"));
    }
  }
}
