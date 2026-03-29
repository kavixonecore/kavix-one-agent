import { ok, err } from "../../shared/types/index.mjs";
import { AppError } from "../../shared/errors/index.mjs";
import { logger } from "../../shared/logger.mjs";

import type { MongoClient, Collection } from "mongodb";
import type { IRunningLog } from "./interfaces/index.mjs";
import type { UpdateRunningLog, RunningLogQuery, IPersonalBests } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";

export class RunningLogRepository {

  private readonly collection: Collection<IRunningLog>;

  public constructor(client: MongoClient, dbName: string) {
    this.collection = client.db(dbName)
.collection<IRunningLog>("running_logs");
  }

  public async create(log: IRunningLog): Promise<Result<IRunningLog, AppError>> {
    try {
      await this.collection.insertOne(log);
      return ok(log);
    } catch (error) {
      logger.error("RunningLogRepository.create failed", { error });
      return err(new AppError("Failed to create running log", 500, "DB_ERROR"));
    }
  }

  public async findAll(query: RunningLogQuery): Promise<Result<IRunningLog[], AppError>> {
    try {
      const filter: { workoutId?: string } = {};
      if (query.workoutId) {
filter.workoutId = query.workoutId;
}

      const skip = (query.page - 1) * query.limit;
      const docs = await this.collection
        .find(filter, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .toArray();
      return ok(docs);
    } catch (error) {
      logger.error("RunningLogRepository.findAll failed", { error });
      return err(new AppError("Failed to find running logs", 500, "DB_ERROR"));
    }
  }

  public async findById(id: string): Promise<Result<IRunningLog | null, AppError>> {
    try {
      const doc = await this.collection.findOne({ id }, { projection: { _id: 0 } });
      return ok(doc);
    } catch (error) {
      logger.error("RunningLogRepository.findById failed", { error });
      return err(new AppError("Failed to find running log", 500, "DB_ERROR"));
    }
  }

  public async findByWorkoutId(workoutId: string): Promise<Result<IRunningLog[], AppError>> {
    try {
      const docs = await this.collection.find({ workoutId }, { projection: { _id: 0 } })
.toArray();
      return ok(docs);
    } catch (error) {
      logger.error("RunningLogRepository.findByWorkoutId failed", { error });
      return err(new AppError("Failed to find running logs by workout", 500, "DB_ERROR"));
    }
  }

  public async getPersonalBests(): Promise<Result<IPersonalBests, AppError>> {
    try {
      const [fastestResult, longestDistResult, longestDurResult] = await Promise.all([
        this.collection.find()
.sort({ paceMinutesPerMile: 1 })
.limit(1)
.toArray(),
        this.collection.find()
.sort({ distanceMiles: -1 })
.limit(1)
.toArray(),
        this.collection.find()
.sort({ durationMinutes: -1 })
.limit(1)
.toArray(),
      ]);

      return ok({
        fastestPace: fastestResult[0]?.paceMinutesPerMile ?? null,
        longestDistance: longestDistResult[0]?.distanceMiles ?? null,
        longestDuration: longestDurResult[0]?.durationMinutes ?? null,
      });
    } catch (error) {
      logger.error("RunningLogRepository.getPersonalBests failed", { error });
      return err(new AppError("Failed to get personal bests", 500, "DB_ERROR"));
    }
  }

  public async update(id: string, data: UpdateRunningLog): Promise<Result<IRunningLog | null, AppError>> {
    try {
      const updateData: Partial<IRunningLog> = {
        updatedAt: new Date()
.toISOString(),
      };
      if (data.distanceMiles !== undefined) {
updateData.distanceMiles = data.distanceMiles;
}
      if (data.durationMinutes !== undefined) {
updateData.durationMinutes = data.durationMinutes;
}
      if (data.paceMinutesPerMile !== undefined) {
updateData.paceMinutesPerMile = data.paceMinutesPerMile;
}
      if (data.routeName !== undefined) {
updateData.routeName = data.routeName;
}
      if (data.elevationGainFeet !== undefined) {
updateData.elevationGainFeet = data.elevationGainFeet;
}
      if (data.heartRateAvg !== undefined) {
updateData.heartRateAvg = data.heartRateAvg;
}
      if (data.weather !== undefined) {
updateData.weather = data.weather;
}
      if (data.notes !== undefined) {
updateData.notes = data.notes;
}

      const result = await this.collection.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: "after", projection: { _id: 0 } },
      );
      return ok(result);
    } catch (error) {
      logger.error("RunningLogRepository.update failed", { error });
      return err(new AppError("Failed to update running log", 500, "DB_ERROR"));
    }
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.collection.deleteOne({ id });
      return ok(result.deletedCount === 1);
    } catch (error) {
      logger.error("RunningLogRepository.delete failed", { error });
      return err(new AppError("Failed to delete running log", 500, "DB_ERROR"));
    }
  }

  public async count(query: Omit<RunningLogQuery, "page" | "limit">): Promise<Result<number, AppError>> {
    try {
      const filter: { workoutId?: string } = {};
      if (query.workoutId) {
filter.workoutId = query.workoutId;
}
      const total = await this.collection.countDocuments(filter);
      return ok(total);
    } catch (error) {
      logger.error("RunningLogRepository.count failed", { error });
      return err(new AppError("Failed to count running logs", 500, "DB_ERROR"));
    }
  }
}
