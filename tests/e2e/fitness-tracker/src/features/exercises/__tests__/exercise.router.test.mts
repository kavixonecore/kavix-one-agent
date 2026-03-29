import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { ulid } from "ulidx";
import winston from "winston";

import { createExerciseRouter } from "../exercise.router.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { NotFoundError, AppError } from "../../../shared/errors/index.mjs";

import type { ExerciseService } from "../exercise.service.mjs";
import type { IExercise } from "../interfaces/index.mjs";

const testLogger = winston.createLogger({ silent: true });

const makeExercise = (): IExercise => ({
  id: ulid(),
  name: "Bench Press",
  description: "A chest exercise",
  muscleGroup: "chest",
  difficultyLevel: "intermediate",
  equipmentRequired: [],
  instructions: "Press it",
  createdAt: new Date()
.toISOString(),
  updatedAt: new Date()
.toISOString(),
});

const makeMockService = (): ExerciseService => ({
  create: mock(() => Promise.resolve(ok(makeExercise()))),
  findAll: mock(() => Promise.resolve(ok({ data: [makeExercise()], count: 1 }))),
  findById: mock(() => Promise.resolve(ok(makeExercise()))),
  update: mock(() => Promise.resolve(ok(makeExercise()))),
  delete: mock(() => Promise.resolve(ok(true))),
} as unknown as ExerciseService);

const buildApp = (service: ExerciseService): Elysia => {
  return new Elysia()
.use(createExerciseRouter(testLogger, service)) as unknown as Elysia;
};

describe("ExerciseRouter", () => {
  let mockService: ExerciseService;
  let app: Elysia;

  beforeEach(() => {
    mockService = makeMockService();
    app = buildApp(mockService);
  });

  it("POST /exercises should create exercise and return 201", async () => {
    const res = await app.handle(
      new Request("http://localhost/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Squat",
          description: "Leg exercise",
          muscleGroup: "legs",
          difficultyLevel: "beginner",
          equipmentRequired: [],
          instructions: "Do the squat",
        }),
      })
    );
    expect(res.status)
.toBe(201);
    const body = await res.json() as { success: boolean };
    expect(body.success)
.toBe(true);
  });

  it("POST /exercises should return 400 on validation error", async () => {
    const res = await app.handle(
      new Request("http://localhost/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      })
    );
    expect(res.status)
.toBe(400);
  });

  it("GET /exercises should return list", async () => {
    const res = await app.handle(new Request("http://localhost/exercises"));
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean; data: unknown[]; count: number };
    expect(body.success)
.toBe(true);
    expect(body.count)
.toBe(1);
  });

  it("GET /exercises/:id should return exercise", async () => {
    const res = await app.handle(new Request("http://localhost/exercises/some-id"));
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success)
.toBe(true);
  });

  it("GET /exercises/:id should return 404 when not found", async () => {
    mockService.findById = mock(() => Promise.resolve(err(new NotFoundError("Exercise", "id"))));
    app = buildApp(mockService);
    const res = await app.handle(new Request("http://localhost/exercises/nonexistent"));
    expect(res.status)
.toBe(404);
  });

  it("PUT /exercises/:id should update exercise", async () => {
    const res = await app.handle(
      new Request("http://localhost/exercises/some-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      })
    );
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success)
.toBe(true);
  });

  it("DELETE /exercises/:id should delete exercise", async () => {
    const res = await app.handle(
      new Request("http://localhost/exercises/some-id", { method: "DELETE" })
    );
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success)
.toBe(true);
  });

  it("DELETE /exercises/:id should return 500 on db error", async () => {
    mockService.delete = mock(() => Promise.resolve(err(new AppError("DB error", 500, "DB_ERROR"))));
    app = buildApp(mockService);
    const res = await app.handle(
      new Request("http://localhost/exercises/some-id", { method: "DELETE" })
    );
    expect(res.status)
.toBe(500);
  });
});
