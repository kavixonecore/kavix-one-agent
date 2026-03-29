import { ulid } from "ulidx";
import type { IWorkoutExercise } from "./interfaces/index.mjs";
import type { CreateWorkoutExercise, UpdateWorkoutExercise, WorkoutExerciseQuery } from "./types/index.mjs";
import type { Result } from "../../shared/types/index.mjs";
import { ok, err } from "../../shared/types/index.mjs";
import { NotFoundError, ValidationError } from "../../shared/errors/index.mjs";
import type { AppError } from "../../shared/errors/index.mjs";
import type { WorkoutExerciseRepository } from "./workout-exercise.repository.mjs";
import type { WorkoutService } from "../workouts/workout.service.mjs";
import type { ExerciseService } from "../exercises/exercise.service.mjs";

export interface IWorkoutExerciseListResult {
  data: IWorkoutExercise[];
  count: number;
}

export class WorkoutExerciseService {

  private readonly repository: WorkoutExerciseRepository;
  private readonly workoutService: WorkoutService;
  private readonly exerciseService: ExerciseService;

  public constructor(
    repository: WorkoutExerciseRepository,
    workoutService: WorkoutService,
    exerciseService: ExerciseService,
  ) {
    this.repository = repository;
    this.workoutService = workoutService;
    this.exerciseService = exerciseService;
  }

  public async create(data: CreateWorkoutExercise): Promise<Result<IWorkoutExercise, AppError>> {
    const [workoutResult, exerciseResult] = await Promise.all([
      this.workoutService.findById(data.workoutId),
      this.exerciseService.findById(data.exerciseId),
    ]);

    if (!workoutResult.ok) {
      return err(new ValidationError(`Workout with id '${data.workoutId}' not found`));
    }
    if (!exerciseResult.ok) {
      return err(new ValidationError(`Exercise with id '${data.exerciseId}' not found`));
    }

    const now = new Date().toISOString();
    const workoutExercise: IWorkoutExercise = {
      id: ulid(),
      workoutId: data.workoutId,
      exerciseId: data.exerciseId,
      order: data.order,
      sets: data.sets,
      reps: data.reps,
      weightLbs: data.weightLbs,
      durationSeconds: data.durationSeconds,
      restSeconds: data.restSeconds,
      notes: data.notes,
      userId: data.userId,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(workoutExercise);
  }

  public async findAll(query: WorkoutExerciseQuery): Promise<Result<IWorkoutExerciseListResult, AppError>> {
    const [dataResult, countResult] = await Promise.all([
      this.repository.findAll(query),
      this.repository.count({ workoutId: query.workoutId, exerciseId: query.exerciseId }),
    ]);

    if (!dataResult.ok) {
      return err(dataResult.error);
    }
    if (!countResult.ok) {
      return err(countResult.error);
    }

    return ok({ data: dataResult.value, count: countResult.value });
  }

  public async findById(id: string): Promise<Result<IWorkoutExercise, AppError>> {
    const result = await this.repository.findById(id);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("WorkoutExercise", id));
    }
    return ok(result.value);
  }

  public async findByWorkoutId(workoutId: string): Promise<Result<IWorkoutExercise[], AppError>> {
    return this.repository.findByWorkoutId(workoutId);
  }

  public async update(id: string, data: UpdateWorkoutExercise): Promise<Result<IWorkoutExercise, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("WorkoutExercise", id));
    }

    const result = await this.repository.update(id, data);
    if (!result.ok) {
      return err(result.error);
    }
    if (!result.value) {
      return err(new NotFoundError("WorkoutExercise", id));
    }
    return ok(result.value);
  }

  public async delete(id: string): Promise<Result<boolean, AppError>> {
    const existsResult = await this.repository.findById(id);
    if (!existsResult.ok) {
      return err(existsResult.error);
    }
    if (!existsResult.value) {
      return err(new NotFoundError("WorkoutExercise", id));
    }

    return this.repository.delete(id);
  }
}
