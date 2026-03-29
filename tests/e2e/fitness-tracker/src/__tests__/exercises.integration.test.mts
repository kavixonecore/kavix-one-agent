import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface ExerciseData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly muscleGroup: string;
  readonly difficultyLevel: string;
  readonly equipmentRequired: string[];
  readonly instructions: string;
  readonly userId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface SuccessResponse<T> {
  readonly success: true;
  readonly data: T;
}

interface ListResponse<T> {
  readonly success: true;
  readonly data: T[];
  readonly count: number;
}

interface ErrorResponse {
  readonly success: false;
  readonly error: string;
}

const validExerciseBody = {
  name: "Bench Press",
  description: "A classic chest exercise",
  muscleGroup: "chest",
  difficultyLevel: "intermediate",
  equipmentRequired: ["barbell", "bench"],
  instructions: "Lie on bench, lower bar to chest, press up",
};

const authHeaders = (token: string): Record<string, string> => ({
  "Authorization": `Bearer ${token}`,
});

const jsonHeaders = (token: string): Record<string, string> => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

describe("Exercises Integration Tests", () => {
  let server: ITestServer;
  let createdId: string;

  beforeAll(async (): Promise<void> => {
    server = await startTestServer();
  });

  afterAll(async (): Promise<void> => {
    await server.cleanup();
  });

  it("GET /exercises without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises`);
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /exercises without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validExerciseBody),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /exercises — missing required field name returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        description: "Missing name field",
        muscleGroup: "chest",
        difficultyLevel: "beginner",
        instructions: "Some instructions",
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
  });

  it("POST /exercises — invalid enum difficultyLevel returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ ...validExerciseBody, difficultyLevel: "super_hard" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /exercises — invalid enum muscleGroup returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ ...validExerciseBody, muscleGroup: "glutes" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /exercises — creates exercise with valid body, returns 201", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify(validExerciseBody),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<ExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Bench Press");
    expect(body.data.muscleGroup).toBe("chest");
    expect(body.data.difficultyLevel).toBe("intermediate");
    expect(typeof body.data.id).toBe("string");
    expect(typeof body.data.createdAt).toBe("string");
    expect(typeof body.data.updatedAt).toBe("string");
    createdId = body.data.id;
  });

  it("GET /exercises — returns 200 with array containing created item", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<ExerciseData>;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.count).toBe("number");
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(body.data.some((e) => e.id === createdId)).toBe(true);
  });

  it("GET /exercises?muscleGroup=chest — filters, only chest exercises returned", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises?muscleGroup=chest`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<ExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    for (const exercise of body.data) {
      expect(exercise.muscleGroup).toBe("chest");
    }
  });

  it("GET /exercises?name=bench — searches by name, returns matching results", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises?name=bench`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<ExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.some((e) => e.name.toLowerCase().includes("bench"))).toBe(true);
  });

  it("GET /exercises/:id — returns 200 with matching data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<ExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdId);
    expect(body.data.name).toBe("Bench Press");
    expect(body.data.muscleGroup).toBe("chest");
  });

  it("GET /exercises/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/01NONEXISTENTID000000000000`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
  });

  it("PUT /exercises/:id — updates name, returns 200 with new data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ name: "Incline Bench Press" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<ExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Incline Bench Press");
    expect(body.data.id).toBe(createdId);
  });

  it("GET /exercises/:id — verify updated name persisted", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<ExerciseData>;
    expect(body.data.name).toBe("Incline Bench Press");
  });

  it("PUT /exercises/:id — invalid difficultyLevel enum returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ difficultyLevel: "super_hard" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("PUT /exercises/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/01NONEXISTENTID000000000000`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ name: "Ghost Exercise" }),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /exercises/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/01NONEXISTENTID000000000000`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /exercises/:id — deletes exercise, returns 200 with deleted: true", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it("GET /exercises/:id — deleted exercise returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/exercises/${createdId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });
});
