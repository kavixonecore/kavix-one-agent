import { getMongoClient } from "./database.mjs";
import { logger } from "./logger.mjs";
import { ExerciseRepository } from "../features/exercises/exercise.repository.mjs";
import { ExerciseService } from "../features/exercises/exercise.service.mjs";
import { WorkoutRepository } from "../features/workouts/workout.repository.mjs";
import { WorkoutService } from "../features/workouts/workout.service.mjs";
import { ProgressMetricRepository } from "../features/progress-metrics/progress-metric.repository.mjs";
import { ProgressMetricService } from "../features/progress-metrics/progress-metric.service.mjs";
import { RunningLogRepository } from "../features/running-logs/running-log.repository.mjs";
import { RunningLogService } from "../features/running-logs/running-log.service.mjs";
import { WorkoutExerciseRepository } from "../features/workout-exercises/workout-exercise.repository.mjs";
import { WorkoutExerciseService } from "../features/workout-exercises/workout-exercise.service.mjs";

import type { MongoClient } from "mongodb";

export interface IAppContainer {
  db: MongoClient;
  dbName: string;
  exerciseRepository: ExerciseRepository;
  exerciseService: ExerciseService;
  workoutRepository: WorkoutRepository;
  workoutService: WorkoutService;
  progressMetricRepository: ProgressMetricRepository;
  progressMetricService: ProgressMetricService;
  runningLogRepository: RunningLogRepository;
  runningLogService: RunningLogService;
  workoutExerciseRepository: WorkoutExerciseRepository;
  workoutExerciseService: WorkoutExerciseService;
}

let container: IAppContainer | null = null;

export const getContainer = async (): Promise<IAppContainer> => {
  if (container) {
    return container;
  }

  const db = await getMongoClient();
  const dbName = process.env["NODE_ENV"] === "test"
    ? "fitness_tracker_test"
    : "fitness_tracker";

  const exerciseRepository = new ExerciseRepository(db, dbName);
  const exerciseService = new ExerciseService(exerciseRepository);

  const workoutRepository = new WorkoutRepository(db, dbName);
  const workoutService = new WorkoutService(workoutRepository);

  const progressMetricRepository = new ProgressMetricRepository(db, dbName);
  const progressMetricService = new ProgressMetricService(progressMetricRepository);

  const runningLogRepository = new RunningLogRepository(db, dbName);
  const runningLogService = new RunningLogService(runningLogRepository, workoutService);

  const workoutExerciseRepository = new WorkoutExerciseRepository(db, dbName);
  const workoutExerciseService = new WorkoutExerciseService(
    workoutExerciseRepository,
    workoutService,
    exerciseService
  );

  container = {
    db,
    dbName,
    exerciseRepository,
    exerciseService,
    workoutRepository,
    workoutService,
    progressMetricRepository,
    progressMetricService,
    runningLogRepository,
    runningLogService,
    workoutExerciseRepository,
    workoutExerciseService,
  };

  logger.info("DI container initialized", { dbName });

  return container;
};

export const resetContainer = (): void => {
  container = null;
};
