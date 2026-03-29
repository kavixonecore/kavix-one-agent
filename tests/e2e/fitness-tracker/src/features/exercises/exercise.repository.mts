import { ok, err } from "../../shared/types/index.mjs";
import { AppError } from "../../shared/errors/index.mjs";
import { logger } from "../../shared/logger.mjs";

import type { MongoClient, Collection } from "mongodb";
import type { IExercise } from "./interfaces/index.mjs";
import type { UpdateExercise, ExerciseQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import type { MuscleGroupValue } from "./exercise.constants.mjs";

export class ExerciseRepository {

  private readonly collection: Collection<IExercise>;

  public constructor(client: MongoClient, dbName: string) {
    this.collection = client.db(dbName)
.collection<IExercise>("exercises");
  }

  public async create(exercise: IExercise): Promise<Result<IExercise, AppError>> {
    try {
      await this.collection.insertOne(exercise);
      return ok(exercise);
    } catch (error) {
      logger.error("ExerciseRepository.create failed", { error });
      return err(new AppError("Failed to create exercise", 500, "DB_ERROR"));
    }
  }

  public async findAll(query: ExerciseQuery): Promise<Result<IExercise[], AppError>> {
    try {
      const filter: { muscleGroup?: MuscleGroupValue; name?: { $regex: string; $options: string } } = {};
      if (query.muscleGroup) {
        filter.muscleGroup = query.muscleGroup as MuscleGroupValue;
      }
      if (query.name) {
        filter.name = { $regex: query.name, $options: "i" };
      }
      const skip = (query.page - 1) * query.limit;
      const docs = await this.collection
        .find(filter, { projection: { _id: 0 } })
        .skip(skip)
        .limit(query.limit)
        .toArray();
      return ok(docs);
    } catch (error) {
      logger.error("ExerciseRepository.findAll failed", { error });
      return err(new AppError("Failed to find exercises", 500, "DB_ERROR"));
    }
  }

  public async findById(id: string): Promise<Result<IExercise | null, AppError>> {
    try {
      const doc = await this.collection.findOne({ id }, { projection: { _id: 0 } });
      return ok(doc);
    } catch (error) {
      logger.error("ExerciseRepository.findById failed", { error });
      return err(new AppError("Failed to find exercise", 500, "DB_ERROR"));
    }
  }

  public async update(id: string, data: UpdateExercise): Promise<Result<IExercise | null, AppError>> {
    try {
      const updateData: Partial<IExercise> = {
        updatedAt: new Date()
.toISOString(),
      };
      if (data.name !== undefined) {
updateData.name = data.name;
}
      if (data.description !== undefined) {
updateData.description = data.description;
}
      if (data.muscleGroup !== undefined) {
updateData.muscleGroup = data.muscleGroup as MuscleGroupValue;
}
      if (data.difficultyLevel !== undefined) {
updateData.difficultyLevel = data.difficultyLevel as IExercise["difficultyLevel"];
}
      if (data.equipmentRequired !== undefined) {
updateData.equipmentRequired = data.equipmentRequired;
}
      if (data.instructions !== undefined) {
updateData.instructions = data.instructions;
}

      const result = await this.collection.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: "after", projection: { _id: 0 } }
      );
      return ok(result);
    } catch (error) {
      logger.error("ExerciseRepository.update failed", { error });
      return err(new AppError("Failed to update exercise", 500, "DB_ERROR"));
    }
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.collection.deleteOne({ id });
      return ok(result.deletedCount === 1);
    } catch (error) {
      logger.error("ExerciseRepository.delete failed", { error });
      return err(new AppError("Failed to delete exercise", 500, "DB_ERROR"));
    }
  }

  public async count(query: Omit<ExerciseQuery, "page" | "limit">): Promise<Result<number, AppError>> {
    try {
      const filter: { muscleGroup?: MuscleGroupValue; name?: { $regex: string; $options: string } } = {};
      if (query.muscleGroup) {
        filter.muscleGroup = query.muscleGroup as MuscleGroupValue;
      }
      if (query.name) {
        filter.name = { $regex: query.name, $options: "i" };
      }
      const total = await this.collection.countDocuments(filter);
      return ok(total);
    } catch (error) {
      logger.error("ExerciseRepository.count failed", { error });
      return err(new AppError("Failed to count exercises", 500, "DB_ERROR"));
    }
  }
}
