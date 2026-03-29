import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { createWorkoutExerciseRouter } from "../workout-exercise.router.mjs";
import type { WorkoutExerciseService } from "../workout-exercise.service.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { NotFoundError } from "../../../shared/errors/index.mjs";
import type { IWorkoutExercise } from "../interfaces/index.mjs";
import { ulid } from "ulidx";
import winston from "winston";

const testLogger = winston.createLogger({ silent: true });

const makeWorkoutExercise = (): IWorkoutExercise => ({
  id: ulid(),
  workoutId: "workout-1",
  exerciseId: "exercise-1",
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const makeMockService = (): WorkoutExerciseService => ({
  create: mock(() => Promise.resolve(ok(makeWorkoutExercise()))),
  findAll: mock(() => Promise.resolve(ok({ data: [makeWorkoutExercise()], count: 1 }))),
  findById: mock(() => Promise.resolve(ok(makeWorkoutExercise()))),
  findByWorkoutId: mock(() => Promise.resolve(ok([makeWorkoutExercise()]))),
  update: mock(() => Promise.resolve(ok(makeWorkoutExercise()))),
  delete: mock(() => Promise.resolve(ok(true))),
} as unknown as WorkoutExerciseService);

const buildApp = (service: WorkoutExerciseService): Elysia => {
  return new Elysia().use(createWorkoutExerciseRouter(testLogger, service)) as unknown as Elysia;
};

describe("WorkoutExerciseRouter", () => {
  let mockService: WorkoutExerciseService;
  let app: Elysia;

  beforeEach(() => {
    mockService = makeMockService();
    app = buildApp(mockService);
  });

  it("POST /workout-exercises should create and return 201", async () => {
    const res = await app.handle(
      new Request("http://localhost/workout-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: "workout-1",
          exerciseId: "exercise-1",
          order: 1,
        }),
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it("POST /workout-exercises should return 400 on validation error", async () => {
    const res = await app.handle(
      new Request("http://localhost/workout-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: "" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("GET /workout-exercises should return list", async () => {
    const res = await app.handle(new Request("http://localhost/workout-exercises"));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; count: number };
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });

  it("GET /workout-exercises/workout/:workoutId should return exercises", async () => {
    const res = await app.handle(new Request("http://localhost/workout-exercises/workout/workout-1"));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; count: number };
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });

  it("GET /workout-exercises/:id should return 404 when not found", async () => {
    mockService.findById = mock(() => Promise.resolve(err(new NotFoundError("WorkoutExercise", "id"))));
    app = buildApp(mockService);
    const res = await app.handle(new Request("http://localhost/workout-exercises/nonexistent"));
    expect(res.status).toBe(404);
  });

  it("PUT /workout-exercises/:id should update", async () => {
    const res = await app.handle(
      new Request("http://localhost/workout-exercises/some-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: 2 }),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("DELETE /workout-exercises/:id should delete", async () => {
    const res = await app.handle(
      new Request("http://localhost/workout-exercises/some-id", { method: "DELETE" }),
    );
    expect(res.status).toBe(200);
  });
});
