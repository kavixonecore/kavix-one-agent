import { ulid } from "ulidx";

import { ok, err } from "../../shared/types/index.mjs";
import { NotFoundError } from "../../shared/errors/index.mjs";

import type { IExercise } from "./interfaces/index.mjs";
import type { CreateExercise, UpdateExercise, ExerciseQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import type { AppError } from "../../shared/errors/index.mjs";
import type { ExerciseRepository } from "./exercise.repository.mjs";
import type { MuscleGroupValue, DifficultyLevelValue } from "./exercise.constants.mjs";

export interface IExerciseListResult {
  data: IExercise[];
  count: number;
}

export class ExerciseService {

  private readonly repository: ExerciseRepository;

  public constructor(repository: ExerciseRepository) {
    this.repository = repository;
  }

  public async create(data: CreateExercise): Promise<Result<IExercise, AppError>> {
    const now = new Date()
.toISOString();
    const exercise: IExercise = {
      id: ulid(),
      name: data.name,
      description: data.description,
      muscleGroup: data.muscleGroup as MuscleGroupValue,
      difficultyLevel: data.difficultyLevel as DifficultyLevelValue,
      equipmentRequired: data.equipmentRequired,
      instructions: data.instructions,
      ...(data.userId !== undefined && { userId: data.userId }),
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(exercise);
  }

  public async findAll(query: ExerciseQuery): Promise<Result<IExerciseListResult, AppError>> {
    const [dataResult, countResult] = await Promise.all([
      this.repository.findAll(query),
      this.repository.count({ muscleGroup: query.muscleGroup, name: query.name }),
    ]);

    if (!dataResult.ok) {
      return err(dataResult.error);
    }
    if (!countResult.ok) {
      return err(countResult.error);
    }

    return ok({ data: dataResult.value, count: countResult.value });
  }

  public async findById(id: string): Promise<Result<IExercise, AppError>> {
    const result = await this.repository.findById(id);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("Exercise", id));
    }
    return ok(result.value);
  }

  public async update(id: string, data: UpdateExercise): Promise<Result<IExercise, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("Exercise", id));
    }

    const result = await this.repository.update(id, data);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("Exercise", id));
    }
    return ok(result.value);
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("Exercise", id));
    }

    return this.repository.delete(id);
  }
}
