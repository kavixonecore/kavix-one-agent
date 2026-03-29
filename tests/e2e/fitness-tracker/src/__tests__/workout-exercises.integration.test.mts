import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface WorkoutData {
  id: string;
  name: string;
  workoutType: string;
  status: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ExerciseData {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  difficultyLevel: string;
  equipmentRequired: string[];
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkoutExerciseData {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: number;
  weightLbs?: number;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
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

const today = new Date()
.toISOString()
.split("T")[0] ?? "2026-03-28";

describe("Workout Exercises Integration Tests", () => {
  let server: ITestServer;
  let workoutId: string;
  let exerciseId: string;
  let workoutExerciseId: string;

  beforeAll(async () => {
    server = await startTestServer();

    // Create a workout
    const workoutRes = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Strength Workout",
        workoutType: "weightlifting",
        status: "planned",
        date: today,
      }),
    });
    const workoutBody = await workoutRes.json() as SuccessResponse<WorkoutData>;
    workoutId = workoutBody.data.id;

    // Create an exercise
    const exerciseRes = await fetch(`${server.baseUrl}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  afterAll(async () => {
    await server.cleanup();
  });

  it("POST /workout-exercises — creates link with valid IDs, returns 201", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    expect(res.status)
.toBe(201);
    const body = await res.json() as SuccessResponse<WorkoutExerciseData>;
    expect(body.success)
.toBe(true);
    expect(body.data.workoutId)
.toBe(workoutId);
    expect(body.data.exerciseId)
.toBe(exerciseId);
    expect(body.data.order)
.toBe(1);
    expect(body.data.sets)
.toBe(4);
    expect(body.data.reps)
.toBe(8);
    expect(typeof body.data.id)
.toBe("string");

    workoutExerciseId = body.data.id;
  });

  it("POST /workout-exercises — invalid workoutId returns error", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workoutId: "01NONEXISTENTWORKOUTID00000",
        exerciseId,
        order: 1,
      }),
    });

    expect([400, 404, 500].includes(res.status))
.toBe(true);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("POST /workout-exercises — invalid exerciseId returns error", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workoutId,
        exerciseId: "01NONEXISTENTEXERCISEID0000",
        order: 2,
      }),
    });

    expect([400, 404, 500].includes(res.status))
.toBe(true);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("GET /workout-exercises — returns all workout exercises", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<WorkoutExerciseData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.count)
.toBeGreaterThanOrEqual(1);
  });

  it("GET /workout-exercises/workout/:workoutId — returns exercises for workout", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/workout/${workoutId}`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<WorkoutExerciseData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.data.length)
.toBeGreaterThanOrEqual(1);
    for (const we of body.data) {
      expect(we.workoutId)
.toBe(workoutId);
    }
  });

  it("PUT /workout-exercises/:id — updates sets and reps", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sets: 5, reps: 5, weightLbs: 205 }),
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutExerciseData>;
    expect(body.success)
.toBe(true);
    expect(body.data.sets)
.toBe(5);
    expect(body.data.reps)
.toBe(5);
    expect(body.data.weightLbs)
.toBe(205);
    expect(body.data.id)
.toBe(workoutExerciseId);
  });

  it("DELETE /workout-exercises/:id — deletes workout exercise", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`, {
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

  it("GET /workout-exercises/:id — deleted record returns 404", async () => {
    const res = await fetch(`${server.baseUrl}/workout-exercises/${workoutExerciseId}`);

    expect(res.status)
.toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });
});
