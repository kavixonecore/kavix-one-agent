import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface WorkoutData {
  id: string;
  name: string;
  workoutType: string;
  status: string;
  date: string;
  durationMinutes?: number;
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
const yesterday = new Date(Date.now() - 86400000)
.toISOString()
.split("T")[0] ?? "2026-03-27";
const tomorrow = new Date(Date.now() + 86400000)
.toISOString()
.split("T")[0] ?? "2026-03-29";

describe("Workouts Integration Tests", () => {
  let server: ITestServer;
  let createdId: string;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.cleanup();
  });

  it("POST /workouts — creates workout with valid body, returns 201", async () => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Morning Run",
        workoutType: "running",
        status: "planned",
        date: today,
        durationMinutes: 45,
        notes: "Easy pace",
      }),
    });

    expect(res.status)
.toBe(201);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.success)
.toBe(true);
    expect(body.data.name)
.toBe("Morning Run");
    expect(body.data.workoutType)
.toBe("running");
    expect(body.data.status)
.toBe("planned");
    expect(typeof body.data.id)
.toBe("string");

    createdId = body.data.id;
  });

  it("POST /workouts — invalid body returns 400", async () => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Missing type",
        date: today,
      }),
    });

    expect(res.status)
.toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("GET /workouts — returns list of workouts", async () => {
    const res = await fetch(`${server.baseUrl}/workouts`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.count)
.toBeGreaterThanOrEqual(1);
  });

  it("GET /workouts?startDate=...&endDate=... — filters by date range", async () => {
    const res = await fetch(
      `${server.baseUrl}/workouts?startDate=${yesterday}&endDate=${tomorrow}`
    );

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.data.length)
.toBeGreaterThanOrEqual(1);
  });

  it("GET /workouts?status=planned — filters by status", async () => {
    const res = await fetch(`${server.baseUrl}/workouts?status=planned`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    for (const workout of body.data) {
      expect(workout.status)
.toBe("planned");
    }
  });

  it("GET /workouts/:id — returns workout by ID", async () => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.success)
.toBe(true);
    expect(body.data.id)
.toBe(createdId);
    expect(body.data.name)
.toBe("Morning Run");
  });

  it("GET /workouts/:id — nonexistent ID returns 404", async () => {
    const res = await fetch(`${server.baseUrl}/workouts/01NONEXISTENTID000000000000`);

    expect(res.status)
.toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("PUT /workouts/:id — updates status to completed", async () => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.success)
.toBe(true);
    expect(body.data.status)
.toBe("completed");
    expect(body.data.id)
.toBe(createdId);
  });

  it("GET /workouts?status=completed — shows completed workout", async () => {
    const res = await fetch(`${server.baseUrl}/workouts?status=completed`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success)
.toBe(true);
    expect(body.data.some((w) => w.id === createdId))
.toBe(true);
  });

  it("DELETE /workouts/:id — deletes workout successfully", async () => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
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

  it("GET /workouts/:id — deleted workout returns 404", async () => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`);

    expect(res.status)
.toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });
});
