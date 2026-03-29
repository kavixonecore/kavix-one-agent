import { ulid } from "ulidx";

import { ok, err } from "../../shared/types/index.mjs";
import { NotFoundError } from "../../shared/errors/index.mjs";

import type { IWorkout } from "./interfaces/index.mjs";
import type { CreateWorkout, UpdateWorkout, WorkoutQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import type { AppError } from "../../shared/errors/index.mjs";
import type { WorkoutRepository } from "./workout.repository.mjs";
import type { WorkoutTypeValue, WorkoutStatusValue } from "./workout.constants.mjs";

export interface IWorkoutListResult {
  data: IWorkout[];
  count: number;
}

export class WorkoutService {

  private readonly repository: WorkoutRepository;

  public constructor(repository: WorkoutRepository) {
    this.repository = repository;
  }

  public async create(data: CreateWorkout): Promise<Result<IWorkout, AppError>> {
    const now = new Date()
.toISOString();
    const workout: IWorkout = {
      id: ulid(),
      name: data.name,
      workoutType: data.workoutType as WorkoutTypeValue,
      status: data.status as WorkoutStatusValue,
      date: data.date,
      ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.userId !== undefined && { userId: data.userId }),
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(workout);
  }

  public async findAll(query: WorkoutQuery): Promise<Result<IWorkoutListResult, AppError>> {
    const [dataResult, countResult] = await Promise.all([
      this.repository.findAll(query),
      this.repository.count({
        startDate: query.startDate,
        endDate: query.endDate,
        status: query.status,
        workoutType: query.workoutType,
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

  public async findById(id: string): Promise<Result<IWorkout, AppError>> {
    const result = await this.repository.findById(id);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("Workout", id));
    }
    return ok(result.value);
  }

  public async update(id: string, data: UpdateWorkout): Promise<Result<IWorkout, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("Workout", id));
    }

    const result = await this.repository.update(id, data);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("Workout", id));
    }
    return ok(result.value);
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("Workout", id));
    }

    return this.repository.delete(id);
  }
}
