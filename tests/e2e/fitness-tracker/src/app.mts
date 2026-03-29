import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { createTracePlugin, logger } from "./shared/logger.mjs";
import { createExerciseRouter } from "./features/exercises/exercise.router.mjs";
import { createWorkoutRouter } from "./features/workouts/workout.router.mjs";
import { createProgressMetricRouter } from "./features/progress-metrics/progress-metric.router.mjs";
import { createRunningLogRouter } from "./features/running-logs/running-log.router.mjs";
import { createWorkoutExerciseRouter } from "./features/workout-exercises/workout-exercise.router.mjs";
import type { IAppContainer } from "./shared/container.mjs";

const startTime = Date.now();

export const createApp = (container?: IAppContainer): Elysia => {
  const app = new Elysia();

  app.use(createTracePlugin());

  app.use(
    cors({
      origin: ["http://localhost:4200"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(
    swagger({
      documentation: {
        info: {
          title: "Fitness Tracker API",
          version: "1.0.0",
          description: "REST API for tracking fitness workouts, exercises, running logs, and progress metrics",
        },
        tags: [
          { name: "Health", description: "Health and version endpoints" },
          { name: "Exercises", description: "Exercise catalog management" },
          { name: "Workouts", description: "Workout session management" },
          { name: "Progress Metrics", description: "Body metrics tracking" },
          { name: "Running Logs", description: "Running session tracking" },
          { name: "Workout Exercises", description: "Exercise-workout linking" },
        ],
      },
    }),
  );

  app.get(
    "/healthz",
    () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
    }),
    {
      detail: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns server health status",
      },
    },
  );

  app.get(
    "/version",
    () => ({
      version: "1.0.0",
      environment: process.env["NODE_ENV"] ?? "development",
    }),
    {
      detail: {
        tags: ["Health"],
        summary: "Version info",
        description: "Returns the API version and environment",
      },
    },
  );

  if (container) {
    app.use(createExerciseRouter(logger, container.exerciseService));
    app.use(createWorkoutRouter(logger, container.workoutService));
    app.use(createProgressMetricRouter(logger, container.progressMetricService));
    app.use(createRunningLogRouter(logger, container.runningLogService));
    app.use(createWorkoutExerciseRouter(logger, container.workoutExerciseService));
  }

  return app;
};
