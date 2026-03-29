import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { ulid } from "ulidx";
import winston from "winston";

import { createWorkoutRouter } from "../workout.router.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { NotFoundError } from "../../../shared/errors/index.mjs";

import type { WorkoutService } from "../workout.service.mjs";
import type { IWorkout } from "../interfaces/index.mjs";

const testLogger = winston.createLogger({ silent: true });

const makeWorkout = (): IWorkout => ({
  id: ulid(),
  name: "Morning Run",
  workoutType: "running",
  status: "planned",
  date: "2024-01-15",
  createdAt: new Date()
.toISOString(),
  updatedAt: new Date()
.toISOString(),
});

const makeMockService = (): WorkoutService => ({
  create: mock(() => Promise.resolve(ok(makeWorkout()))),
  findAll: mock(() => Promise.resolve(ok({ data: [makeWorkout()], count: 1 }))),
  findById: mock(() => Promise.resolve(ok(makeWorkout()))),
  update: mock(() => Promise.resolve(ok(makeWorkout()))),
  delete: mock(() => Promise.resolve(ok(true))),
} as unknown as WorkoutService);

const buildApp = (service: WorkoutService): Elysia => {
  return new Elysia()
.use(createWorkoutRouter(testLogger, service)) as unknown as Elysia;
};

describe("WorkoutRouter", () => {
  let mockService: WorkoutService;
  let app: Elysia;

  beforeEach(() => {
    mockService = makeMockService();
    app = buildApp(mockService);
  });

  it("POST /workouts should create workout and return 201", async () => {
    const res = await app.handle(
      new Request("http://localhost/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Leg Day",
          workoutType: "weightlifting",
          status: "planned",
          date: "2024-01-15",
        }),
      }),
    );
    expect(res.status)
.toBe(201);
    const body = await res.json() as { success: boolean };
    expect(body.success)
.toBe(true);
  });

  it("POST /workouts should return 400 on validation error", async () => {
    const res = await app.handle(
      new Request("http://localhost/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      }),
    );
    expect(res.status)
.toBe(400);
  });

  it("GET /workouts should return list", async () => {
    const res = await app.handle(new Request("http://localhost/workouts"));
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean; data: unknown[]; count: number };
    expect(body.success)
.toBe(true);
    expect(body.count)
.toBe(1);
  });

  it("GET /workouts with date range should pass query params", async () => {
    const res = await app.handle(
      new Request("http://localhost/workouts?startDate=2024-01-01&endDate=2024-01-31"),
    );
    expect(res.status)
.toBe(200);
  });

  it("GET /workouts/:id should return workout", async () => {
    const res = await app.handle(new Request("http://localhost/workouts/some-id"));
    expect(res.status)
.toBe(200);
  });

  it("GET /workouts/:id should return 404 when not found", async () => {
    mockService.findById = mock(() => Promise.resolve(err(new NotFoundError("Workout", "id"))));
    app = buildApp(mockService);
    const res = await app.handle(new Request("http://localhost/workouts/nonexistent"));
    expect(res.status)
.toBe(404);
  });

  it("PUT /workouts/:id should update workout", async () => {
    const res = await app.handle(
      new Request("http://localhost/workouts/some-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      }),
    );
    expect(res.status)
.toBe(200);
  });

  it("DELETE /workouts/:id should delete workout", async () => {
    const res = await app.handle(
      new Request("http://localhost/workouts/some-id", { method: "DELETE" }),
    );
    expect(res.status)
.toBe(200);
  });
});
