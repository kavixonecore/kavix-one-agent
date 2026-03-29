import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface WorkoutData {
  readonly id: string;
  readonly name: string;
  readonly workoutType: string;
  readonly status: string;
  readonly date: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ExerciseData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly muscleGroup: string;
  readonly difficultyLevel: string;
  readonly equipmentRequired: string[];
  readonly instructions: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface WorkoutExerciseData {
  readonly id: string;
  readonly workoutId: string;
  readonly exerciseId: string;
  readonly order: number;
  readonly sets?: number;
  readonly reps?: number;
  readonly weightLbs?: number;
  readonly durationSeconds?: number;
  readonly restSeconds?: number;
  readonly notes?: string;
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

const today = new Date().toISOString().split("T")[0] ?? "2026-03-28";

const authHeaders = (token: string): Record<string, string> => ({
  "Authorization": `Bearer ${token}`,
});

const jsonHeaders = (token: string): Record<string, string> => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

describe("Workout Exercises Integration Tests", () => {
  let server: ITestServer;
  let workoutId: string;
  let exerciseId: string;
  let workoutExerciseId: string;

  beforeAll(async (): Promise<void> => {
    server = await startTestServer();

    const workoutRes = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        name: "Strength Workout",
        workoutType: "weightlifting",
        status: "planned",
        date: today,
      }),
    });
    const workoutBody = await workoutRes.json() as SuccessResponse<WorkoutData>;
    workoutId = workoutBody.data.id;

    const exerciseRes = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        name: "Barbell Squat",
        description: "Compound lower body exercise",
        muscleGroup: "legs",
        difficultyLevel: "intermediate",
        equipmentRequired: ["barbell", "squat rack"],
        instructions: "Stand with bar on upper back, squat down, drive up",
      }),
    });
    const exerciseBody = await exerciseRes.json() as SuccessResponse<ExerciseData>;
    exerciseId = exerciseBody.data.id;
  });

  afterAll(async (): Promise<void> => {
    await server.cleanup();
  });

  it("GET /workout-exercises without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`);
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /workout-exercises without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutId, exerciseId, order: 1 }),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /workout-exercises — missing required field order returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ workoutId, exerciseId }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /workout-exercises — invalid workoutId returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        workoutId: "01NONEXISTENTWORKOUTID00000",
        exerciseId,
        order: 1,
      }),
    });
    // Service wraps not-found as ValidationError → 400
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
  });

  it("POST /workout-exercises — invalid exerciseId returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        workoutId,
        exerciseId: "01NONEXISTENTEXERCISEID0000",
        order: 2,
      }),
    });
    // Service wraps not-found as ValidationError → 400
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
  });

  it("POST /workout-exercises — creates link with valid IDs, returns 201", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        workoutId,
        exerciseId,
        order: 1,
        sets: 4,
        reps: 8,
        weightLbs: 185,
        restSeconds: 120,
        notes: "Work up to heavy set",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<WorkoutExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.workoutId).toBe(workoutId);
    expect(body.data.exerciseId).toBe(exerciseId);
    expect(body.data.order).toBe(1);
    expect(body.data.sets).toBe(4);
    expect(body.data.reps).toBe(8);
    expect(body.data.weightLbs).toBe(185);
    expect(typeof body.data.id).toBe("string");
    workoutExerciseId = body.data.id;
  });

  it("GET /workout-exercises — returns 200 with all records, count >= 1", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<WorkoutExerciseData>;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(body.data.some((we) => we.id === workoutExerciseId)).toBe(true);
  });

  it("GET /workout-exercises/workout/:workoutId — returns exercises for workout", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/workout/${workoutId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<WorkoutExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    for (const we of body.data) {
      expect(we.workoutId).toBe(workoutId);
    }
    expect(body.data.some((we) => we.id === workoutExerciseId)).toBe(true);
  });

  it("GET /workout-exercises/:id — returns 200 with matching data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(workoutExerciseId);
    expect(body.data.workoutId).toBe(workoutId);
    expect(body.data.exerciseId).toBe(exerciseId);
  });

  it("GET /workout-exercises/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/01NONEXISTENTID000000000000`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("PUT /workout-exercises/:id — updates sets and reps, returns 200", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ sets: 5, reps: 5, weightLbs: 205 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutExerciseData>;
    expect(body.success).toBe(true);
    expect(body.data.sets).toBe(5);
    expect(body.data.reps).toBe(5);
    expect(body.data.weightLbs).toBe(205);
    expect(body.data.id).toBe(workoutExerciseId);
  });

  it("GET /workout-exercises/:id — verify sets/reps/weight update persisted", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutExerciseData>;
    expect(body.data.sets).toBe(5);
    expect(body.data.reps).toBe(5);
    expect(body.data.weightLbs).toBe(205);
  });

  it("PUT /workout-exercises/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/01NONEXISTENTID000000000000`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ sets: 3 }),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /workout-exercises/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/01NONEXISTENTID000000000000`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /workout-exercises/:id — deletes record, returns 200 with deleted: true", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it("GET /workout-exercises/:id — deleted record returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });
});
