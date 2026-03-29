import { ulid } from "ulidx";

import { ok, err } from "../../shared/types/index.mjs";
import { NotFoundError, ValidationError } from "../../shared/errors/index.mjs";

import type { IRunningLog } from "./interfaces/index.mjs";
import type { CreateRunningLog, UpdateRunningLog, RunningLogQuery, IPersonalBests } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import type { AppError } from "../../shared/errors/index.mjs";
import type { RunningLogRepository } from "./running-log.repository.mjs";
import type { WorkoutService } from "../workouts/workout.service.mjs";

export interface IRunningLogListResult {
  data: IRunningLog[];
  count: number;
}

export class RunningLogService {

  private readonly repository: RunningLogRepository;

  private readonly workoutService: WorkoutService;

  public constructor(repository: RunningLogRepository, workoutService: WorkoutService) {
    this.repository = repository;
    this.workoutService = workoutService;
  }

  public async create(data: CreateRunningLog): Promise<Result<IRunningLog, AppError>> {
    const workoutResult = await this.workoutService.findById(data.workoutId);
    if (!workoutResult.ok) {
      return err(new ValidationError(`Workout with id '${data.workoutId}' not found`));
    }

    const pace = data.paceMinutesPerMile ?? (data.durationMinutes / data.distanceMiles);

    const now = new Date()
.toISOString();
    const log: IRunningLog = {
      id: ulid(),
      workoutId: data.workoutId,
      distanceMiles: data.distanceMiles,
      durationMinutes: data.durationMinutes,
      paceMinutesPerMile: pace,
      ...(data.routeName !== undefined && { routeName: data.routeName }),
      ...(data.elevationGainFeet !== undefined && { elevationGainFeet: data.elevationGainFeet }),
      ...(data.heartRateAvg !== undefined && { heartRateAvg: data.heartRateAvg }),
      ...(data.weather !== undefined && { weather: data.weather }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.userId !== undefined && { userId: data.userId }),
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(log);
  }

  public async findAll(query: RunningLogQuery): Promise<Result<IRunningLogListResult, AppError>> {
    const [dataResult, countResult] = await Promise.all([
      this.repository.findAll(query),
      this.repository.count({ workoutId: query.workoutId }),
    ]);

    if (!dataResult.ok) {
      return err(dataResult.error);
    }
    if (!countResult.ok) {
      return err(countResult.error);
    }

    return ok({ data: dataResult.value, count: countResult.value });
  }

  public async findById(id: string): Promise<Result<IRunningLog, AppError>> {
    const result = await this.repository.findById(id);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("RunningLog", id));
    }
    return ok(result.value);
  }

  public async findByWorkoutId(workoutId: string): Promise<Result<IRunningLog[], AppError>> {
    return this.repository.findByWorkoutId(workoutId);
  }

  public async getPersonalBests(): Promise<Result<IPersonalBests, AppError>> {
    return this.repository.getPersonalBests();
  }

  public async update(id: string, data: UpdateRunningLog): Promise<Result<IRunningLog, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("RunningLog", id));
    }

    if (data.durationMinutes !== undefined && data.distanceMiles !== undefined && data.paceMinutesPerMile === undefined) {
      data.paceMinutesPerMile = data.durationMinutes / data.distanceMiles;
    }

    const result = await this.repository.update(id, data);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("RunningLog", id));
    }
    return ok(result.value);
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("RunningLog", id));
    }

    return this.repository.delete(id);
  }
}
