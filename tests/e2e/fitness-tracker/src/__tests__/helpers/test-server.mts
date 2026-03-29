import { MongoClient } from "mongodb";

import { createApp } from "../../app.mjs";
import { ExerciseRepository } from "../../features/exercises/exercise.repository.mjs";
import { ExerciseService } from "../../features/exercises/exercise.service.mjs";
import { WorkoutRepository } from "../../features/workouts/workout.repository.mjs";
import { WorkoutService } from "../../features/workouts/workout.service.mjs";
import { ProgressMetricRepository } from "../../features/progress-metrics/progress-metric.repository.mjs";
import { ProgressMetricService } from "../../features/progress-metrics/progress-metric.service.mjs";
import { RunningLogRepository } from "../../features/running-logs/running-log.repository.mjs";
import { RunningLogService } from "../../features/running-logs/running-log.service.mjs";
import { WorkoutExerciseRepository } from "../../features/workout-exercises/workout-exercise.repository.mjs";
import { WorkoutExerciseService } from "../../features/workout-exercises/workout-exercise.service.mjs";

import type { IAppContainer } from "../../shared/container.mjs";
import type { Elysia } from "elysia";

export interface ITestServer {
  app: Elysia;
  baseUrl: string;
  cleanup: () => Promise<void>;
}

const TEST_DB_NAME = "fitness_tracker_integration_test";

let portCounter = 14000;

const getNextPort = (): number => {
  portCounter += 1;
  return portCounter;
};

export const startTestServer = async (): Promise<ITestServer> => {
  const uri = process.env["MONGODB_URI"] ?? "mongodb://admin:password@localhost:27017/?authSource=admin";
  const client = new MongoClient(uri);
  await client.connect();

  const exerciseRepository = new ExerciseRepository(client, TEST_DB_NAME);
  const exerciseService = new ExerciseService(exerciseRepository);

  const workoutRepository = new WorkoutRepository(client, TEST_DB_NAME);
  const workoutService = new WorkoutService(workoutRepository);

  const progressMetricRepository = new ProgressMetricRepository(client, TEST_DB_NAME);
  const progressMetricService = new ProgressMetricService(progressMetricRepository);

  const runningLogRepository = new RunningLogRepository(client, TEST_DB_NAME);
  const runningLogService = new RunningLogService(runningLogRepository, workoutService);

  const workoutExerciseRepository = new WorkoutExerciseRepository(client, TEST_DB_NAME);
  const workoutExerciseService = new WorkoutExerciseService(
    workoutExerciseRepository,
    workoutService,
    exerciseService
  );

  const container: IAppContainer = {
    db: client,
    dbName: TEST_DB_NAME,
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

  const app = createApp(container);

  const port = getNextPort();
  app.listen(port);

  const baseUrl = `http://localhost:${port}`;

  const cleanup = async (): Promise<void> => {
    await client.db(TEST_DB_NAME)
.dropDatabase();
    await client.close();
    app.stop();
  };

  return { app, baseUrl, cleanup };
};
