import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface ExerciseData {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  difficultyLevel: string;
  equipmentRequired: string[];
  instructions: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ListResponse<T> {
  success: true;
  data: T[];
  count: number;
}

interface ErrorResponse {
  success: false;
  error: string;
}

const validExerciseBody = {
  name: "Bench Press",
  description: "A classic chest exercise",
  muscleGroup: "chest",
  difficultyLevel: "intermediate",
  equipmentRequired: ["barbell", "bench"],
  instructions: "Lie on bench, lower bar to chest, press up",
};

describe("Exercises Integration Tests", () => {
  let server: ITestServer;
  let createdId: string;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.cleanup();
  });

  it("POST /exercises — creates exercise with valid body, returns 201", async () => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validExerciseBody),
    });

    expect(res.status)
.toBe(201);
    const body = await res.json() as SuccessResponse<ExerciseData>;
    expect(body.success)
.toBe(true);
    expect(body.data.name)
.toBe("Bench Press");
    expect(body.data.muscleGroup)
.toBe("chest");
    expect(body.data.difficultyLevel)
.toBe("intermediate");
    expect(typeof body.data.id)
.toBe("string");
    expect(typeof body.data.createdAt)
.toBe("string");

    createdId = body.data.id;
  });

  it("POST /exercises — missing name returns 400", async () => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Missing name field",
        muscleGroup: "chest",
        difficultyLevel: "beginner",
        instructions: "Some instructions",
      }),
    });

    expect(res.status)
.toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("GET /exercises — returns array with count", async () => {
    const res = await fetch(`${server.baseUrl}/exercises`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<ExerciseData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(typeof body.count)
.toBe("number");
    expect(body.count)
.toBeGreaterThanOrEqual(1);
  });

  it("GET /exercises?muscleGroup=chest — filters by muscle group", async () => {
    const res = await fetch(`${server.baseUrl}/exercises?muscleGroup=chest`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<ExerciseData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    for (const exercise of body.data) {
      expect(exercise.muscleGroup)
.toBe("chest");
    }
  });

  it("GET /exercises?name=bench — searches by name", async () => {
    const res = await fetch(`${server.baseUrl}/exercises?name=bench`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<ExerciseData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.data.length)
.toBeGreaterThanOrEqual(1);
  });

  it("GET /exercises/:id — returns the created exercise", async () => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<ExerciseData>;
    expect(body.success)
.toBe(true);
    expect(body.data.id)
.toBe(createdId);
    expect(body.data.name)
.toBe("Bench Press");
  });

  it("GET /exercises/:id — nonexistent ID returns 404", async () => {
    const res = await fetch(`${server.baseUrl}/exercises/01NONEXISTENTID000000000000`);

    expect(res.status)
.toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("PUT /exercises/:id — updates exercise name", async () => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incline Bench Press" }),
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<ExerciseData>;
    expect(body.success)
.toBe(true);
    expect(body.data.name)
.toBe("Incline Bench Press");
    expect(body.data.id)
.toBe(createdId);
  });

  it("PUT /exercises/:id — invalid body returns 400", async () => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficultyLevel: "super_hard" }),
    });

    expect(res.status)
.toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("DELETE /exercises/:id — deletes exercise successfully", async () => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      method: "DELETE",
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success)
.toBe(true);
    expect(body.data.deleted)
.toBe(true);
  });

  it("GET /exercises/:id — deleted exercise returns 404", async () => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`);

    expect(res.status)
.toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });
});
