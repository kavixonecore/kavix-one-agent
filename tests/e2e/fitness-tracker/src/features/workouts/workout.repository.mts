import type { MongoClient, Collection } from "mongodb";
import type { IWorkout } from "./interfaces/index.mjs";
import type { UpdateWorkout, WorkoutQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import { ok, err } from "../../shared/types/index.mjs";
import { AppError } from "../../shared/errors/index.mjs";
import { logger } from "../../shared/logger.mjs";
import type { WorkoutTypeValue, WorkoutStatusValue } from "./workout.constants.mjs";

export class WorkoutRepository {

  private readonly collection: Collection<IWorkout>;

  public constructor(client: MongoClient, dbName: string) {
    this.collection = client.db(dbName).collection<IWorkout>("workouts");
  }

  public async create(workout: IWorkout): Promise<Result<IWorkout, AppError>> {
    try {
      await this.collection.insertOne(workout);
      return ok(workout);
    } catch (error) {
      logger.error("WorkoutRepository.create failed", { error });
      return err(new AppError("Failed to create workout", 500, "DB_ERROR"));
    }
  }

  public async findAll(query: WorkoutQuery): Promise<Result<IWorkout[], AppError>> {
    try {
      const filter: {
        date?: { $gte?: string; $lte?: string };
        status?: WorkoutStatusValue;
        workoutType?: WorkoutTypeValue;
      } = {};

      if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) filter.date.$gte = query.startDate;
        if (query.endDate) filter.date.$lte = query.endDate;
      }
      if (query.status) filter.status = query.status as WorkoutStatusValue;
      if (query.workoutType) filter.workoutType = query.workoutType as WorkoutTypeValue;

      const skip = (query.page - 1) * query.limit;
      const docs = await this.collection
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(query.limit)
        .toArray();
      return ok(docs);
    } catch (error) {
      logger.error("WorkoutRepository.findAll failed", { error });
      return err(new AppError("Failed to find workouts", 500, "DB_ERROR"));
    }
  }

  public async findById(id: string): Promise<Result<IWorkout | null, AppError>> {
    try {
      const doc = await this.collection.findOne({ id });
      return ok(doc);
    } catch (error) {
      logger.error("WorkoutRepository.findById failed", { error });
      return err(new AppError("Failed to find workout", 500, "DB_ERROR"));
    }
  }

  public async update(id: string, data: UpdateWorkout): Promise<Result<IWorkout | null, AppError>> {
    try {
      const updateData: Partial<IWorkout> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.name !== undefined) updateData.name = data.name;
      if (data.workoutType !== undefined) updateData.workoutType = data.workoutType as WorkoutTypeValue;
      if (data.status !== undefined) updateData.status = data.status as WorkoutStatusValue;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const result = await this.collection.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: "after" },
      );
      return ok(result);
    } catch (error) {
      logger.error("WorkoutRepository.update failed", { error });
      return err(new AppError("Failed to update workout", 500, "DB_ERROR"));
    }
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.collection.deleteOne({ id });
      return ok(result.deletedCount === 1);
    } catch (error) {
      logger.error("WorkoutRepository.delete failed", { error });
      return err(new AppError("Failed to delete workout", 500, "DB_ERROR"));
    }
  }

  public async count(query: Omit<WorkoutQuery, "page" | "limit">): Promise<Result<number, AppError>> {
    try {
      const filter: {
        date?: { $gte?: string; $lte?: string };
        status?: WorkoutStatusValue;
        workoutType?: WorkoutTypeValue;
      } = {};

      if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) filter.date.$gte = query.startDate;
        if (query.endDate) filter.date.$lte = query.endDate;
      }
      if (query.status) filter.status = query.status as WorkoutStatusValue;
      if (query.workoutType) filter.workoutType = query.workoutType as WorkoutTypeValue;

      const total = await this.collection.countDocuments(filter);
      return ok(total);
    } catch (error) {
      logger.error("WorkoutRepository.count failed", { error });
      return err(new AppError("Failed to count workouts", 500, "DB_ERROR"));
    }
  }
}
