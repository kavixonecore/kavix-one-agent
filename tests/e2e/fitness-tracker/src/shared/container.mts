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
import { JwksVerifier } from "./auth/jwks-verifier.mjs";
import { RateLimiter } from "./auth/rate-limiter.mjs";
import { AuthAuditLogger } from "./auth/audit-logger.mjs";

import type { MongoClient } from "mongodb";
import type { IAuthConfig } from "./auth/interfaces/i-auth-config.mjs";

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
  jwksVerifier: JwksVerifier;
  rateLimiter: RateLimiter;
  authAuditLogger: AuthAuditLogger;
  authConfig: IAuthConfig;
}

export function buildAuthConfig(): IAuthConfig {
  return {
    jwksUrl: process.env["JWKS_URL"] ?? "http://localhost:3000/.well-known/jwks.json",
    issuer: process.env["JWT_ISSUER"],
    audience: process.env["JWT_AUDIENCE"],
    skipAuth: process.env["SKIP_AUTH"] === "true",
    publicPaths: ["/health", "/version", "/swagger", "/scalar"],
    rateLimitIpPerMin: parseInt(process.env["RATE_LIMIT_IP_PER_MIN"] ?? "100", 10),
    rateLimitUserPerMin: parseInt(process.env["RATE_LIMIT_USER_PER_MIN"] ?? "1000", 10),
  };
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
    exerciseService,
  );

  const authConfig = buildAuthConfig();
  const jwksVerifier = new JwksVerifier(authConfig);
  const rateLimiter = new RateLimiter(authConfig);
  const authAuditLogger = new AuthAuditLogger(logger, db, dbName);

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
    jwksVerifier,
    rateLimiter,
    authAuditLogger,
    authConfig,
  };

  logger.info("DI container initialized", { dbName });

  return container;
};

export const resetContainer = (): void => {
  container = null;
};
