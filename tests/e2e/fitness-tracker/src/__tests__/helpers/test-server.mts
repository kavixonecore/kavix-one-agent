import { MongoClient } from "mongodb";
import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } from "jose";
import type { JWKSFunction } from "../../shared/auth/jwks-verifier.mjs";

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
import { JwksVerifier } from "../../shared/auth/jwks-verifier.mjs";
import { RateLimiter } from "../../shared/auth/rate-limiter.mjs";
import { AuthAuditLogger } from "../../shared/auth/audit-logger.mjs";
import { logger } from "../../shared/logger.mjs";
import { buildAuthConfig } from "../../shared/container.mjs";

import type { IAppContainer } from "../../shared/container.mjs";
import type { Elysia } from "elysia";

export interface ITestServer {
  app: Elysia;
  baseUrl: string;
  cleanup: () => Promise<void>;
  authToken: string;
}

const TEST_DB_NAME = "fitness_tracker_integration_test";

let portCounter = 14000;

const getNextPort = (): number => {
  portCounter += 1;
  return portCounter;
};

async function buildMockJwks(): Promise<{ jwksOverride: JWKSFunction; authToken: string }> {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = "test-key-1";
  publicJwk.use = "sig";
  publicJwk.alg = "RS256";

  const jwksOverride = createLocalJWKSet({ keys: [publicJwk] }) as unknown as JWKSFunction;

  const authToken = await new SignJWT({
    sub: "test-user",
    email: "test@example.com",
    roles: ["user"],
    permissions: [],
  })
    .setProtectedHeader({ alg: "RS256", kid: "test-key-1" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  return { jwksOverride, authToken };
}

export const startTestServer = async (): Promise<ITestServer> => {
  const uri = process.env["MONGODB_URI"] ?? "mongodb://admin:password@localhost:27017/?authSource=admin";
  const client = new MongoClient(uri);
  await client.connect();

  const { jwksOverride, authToken } = await buildMockJwks();

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
    exerciseService,
  );

  const authConfig = buildAuthConfig();
  const jwksVerifier = new JwksVerifier(authConfig, jwksOverride);
  const rateLimiter = new RateLimiter(authConfig);
  const authAuditLogger = new AuthAuditLogger(logger, client, TEST_DB_NAME);

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
    jwksVerifier,
    rateLimiter,
    authAuditLogger,
    authConfig,
  };

  const app = createApp(container);

  const port = getNextPort();
  app.listen(port);

  const baseUrl = `http://localhost:${port}`;

  const cleanup = async (): Promise<void> => {
    rateLimiter.destroy();
    await client.db(TEST_DB_NAME).dropDatabase();
    await client.close();
    app.stop();
  };

  return { app, baseUrl, cleanup, authToken };
};
