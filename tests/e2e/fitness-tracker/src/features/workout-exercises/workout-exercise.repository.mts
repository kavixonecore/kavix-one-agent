import { ok, err } from "../../shared/types/index.mjs";
import { AppError } from "../../shared/errors/index.mjs";
import { logger } from "../../shared/logger.mjs";

import type { MongoClient, Collection } from "mongodb";
import type { IWorkoutExercise } from "./interfaces/index.mjs";
import type { UpdateWorkoutExercise, WorkoutExerciseQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";

export class WorkoutExerciseRepository {

  private readonly collection: Collection<IWorkoutExercise>;

  public constructor(client: MongoClient, dbName: string) {
    this.collection = client.db(dbName)
.collection<IWorkoutExercise>("workout_exercises");
  }

  public async create(workoutExercise: IWorkoutExercise): Promise<Result<IWorkoutExercise, AppError>> {
    try {
      await this.collection.insertOne(workoutExercise);
      return ok(workoutExercise);
    } catch (error) {
      logger.error("WorkoutExerciseRepository.create failed", { error });
      return err(new AppError("Failed to create workout exercise", 500, "DB_ERROR"));
    }
  }

  public async findAll(query: WorkoutExerciseQuery): Promise<Result<IWorkoutExercise[], AppError>> {
    try {
      const filter: { workoutId?: string; exerciseId?: string } = {};
      if (query.workoutId) {
filter.workoutId = query.workoutId;
}
      if (query.exerciseId) {
filter.exerciseId = query.exerciseId;
}

      const skip = (query.page - 1) * query.limit;
      const docs = await this.collection
        .find(filter, { projection: { _id: 0 } })
        .sort({ order: 1 })
        .skip(skip)
        .limit(query.limit)
        .toArray();
      return ok(docs);
    } catch (error) {
      logger.error("WorkoutExerciseRepository.findAll failed", { error });
      return err(new AppError("Failed to find workout exercises", 500, "DB_ERROR"));
    }
  }

  public async findById(id: string): Promise<Result<IWorkoutExercise | null, AppError>> {
    try {
      const doc = await this.collection.findOne({ id }, { projection: { _id: 0 } });
      return ok(doc);
    } catch (error) {
      logger.error("WorkoutExerciseRepository.findById failed", { error });
      return err(new AppError("Failed to find workout exercise", 500, "DB_ERROR"));
    }
  }

  public async findByWorkoutId(workoutId: string): Promise<Result<IWorkoutExercise[], AppError>> {
    try {
      const docs = await this.collection
        .find({ workoutId }, { projection: { _id: 0 } })
        .sort({ order: 1 })
        .toArray();
      return ok(docs);
    } catch (error) {
      logger.error("WorkoutExerciseRepository.findByWorkoutId failed", { error });
      return err(new AppError("Failed to find workout exercises by workout", 500, "DB_ERROR"));
    }
  }

  public async update(id: string, data: UpdateWorkoutExercise): Promise<Result<IWorkoutExercise | null, AppError>> {
    try {
      const updateData: Partial<IWorkoutExercise> = {
        updatedAt: new Date()
.toISOString(),
      };
      if (data.order !== undefined) {
updateData.order = data.order;
}
      if (data.sets !== undefined) {
updateData.sets = data.sets;
}
      if (data.reps !== undefined) {
updateData.reps = data.reps;
}
      if (data.weightLbs !== undefined) {
updateData.weightLbs = data.weightLbs;
}
      if (data.durationSeconds !== undefined) {
updateData.durationSeconds = data.durationSeconds;
}
      if (data.restSeconds !== undefined) {
updateData.restSeconds = data.restSeconds;
}
      if (data.notes !== undefined) {
updateData.notes = data.notes;
}

      const result = await this.collection.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: "after", projection: { _id: 0 } }
      );
      return ok(result);
    } catch (error) {
      logger.error("WorkoutExerciseRepository.update failed", { error });
      return err(new AppError("Failed to update workout exercise", 500, "DB_ERROR"));
    }
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.collection.deleteOne({ id });
      return ok(result.deletedCount === 1);
    } catch (error) {
      logger.error("WorkoutExerciseRepository.delete failed", { error });
      return err(new AppError("Failed to delete workout exercise", 500, "DB_ERROR"));
    }
  }

  public async count(query: Omit<WorkoutExerciseQuery, "page" | "limit">): Promise<Result<number, AppError>> {
    try {
      const filter: { workoutId?: string; exerciseId?: string } = {};
      if (query.workoutId) {
filter.workoutId = query.workoutId;
}
      if (query.exerciseId) {
filter.exerciseId = query.exerciseId;
}
      const total = await this.collection.countDocuments(filter);
      return ok(total);
    } catch (error) {
      logger.error("WorkoutExerciseRepository.count failed", { error });
      return err(new AppError("Failed to count workout exercises", 500, "DB_ERROR"));
    }
  }
}
