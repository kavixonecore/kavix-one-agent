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

interface RunningLogData {
  id: string;
  workoutId: string;
  distanceMiles: number;
  durationMinutes: number;
  paceMinutesPerMile: number;
  routeName?: string;
  elevationGainFeet?: number;
  heartRateAvg?: number;
  weather?: string;
  notes?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

interface PersonalBestsData {
  fastestPace: number | null;
  longestDistance: number | null;
  longestDuration: number | null;
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

describe("Running Logs Integration Tests", () => {
  let server: ITestServer;
  let workoutId: string;
  let runningLogId: string;

  beforeAll(async () => {
    server = await startTestServer();

    // Create a workout to link running logs to
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server.authToken}`,
      },
      body: JSON.stringify({
        name: "Running Workout",
        workoutType: "running",
        status: "planned",
        date: today,
      }),
    });
    const body = await res.json() as SuccessResponse<WorkoutData>;
    workoutId = body.data.id;
  });

  afterAll(async () => {
    await server.cleanup();
  });

  it("POST /running-logs — creates log with valid workoutId, returns 201", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server.authToken}`,
      },
      body: JSON.stringify({
        workoutId,
        distanceMiles: 5.0,
        durationMinutes: 45,
        paceMinutesPerMile: 9.0,
        routeName: "Park Loop",
        weather: "sunny",
        notes: "Felt great",
      }),
    });

    expect(res.status)
.toBe(201);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.success)
.toBe(true);
    expect(body.data.workoutId)
.toBe(workoutId);
    expect(body.data.distanceMiles)
.toBe(5.0);
    expect(body.data.durationMinutes)
.toBe(45);
    expect(body.data.paceMinutesPerMile)
.toBe(9.0);
    expect(typeof body.data.id)
.toBe("string");

    runningLogId = body.data.id;
  });

  it("POST /running-logs — invalid workoutId returns error", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server.authToken}`,
      },
      body: JSON.stringify({
        workoutId: "01NONEXISTENTWORKOUTID00000",
        distanceMiles: 3.0,
        durationMinutes: 30,
      }),
    });

    // Service returns ValidationError (400) for unknown workoutId
    expect([400, 404, 500].includes(res.status))
.toBe(true);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("POST /running-logs — without pace auto-calculates durationMinutes/distanceMiles", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server.authToken}`,
      },
      body: JSON.stringify({
        workoutId,
        distanceMiles: 4.0,
        durationMinutes: 40,
        // paceMinutesPerMile omitted intentionally
      }),
    });

    expect(res.status)
.toBe(201);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.success)
.toBe(true);
    // pace = durationMinutes / distanceMiles = 40 / 4 = 10
    expect(body.data.paceMinutesPerMile)
.toBe(10);
  });

  it("GET /running-logs — returns all running logs", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      headers: { "Authorization": `Bearer ${server.authToken}` },
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<RunningLogData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.count)
.toBeGreaterThanOrEqual(1);
  });

  it("GET /running-logs/workout/:workoutId — filters by workout", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs/workout/${workoutId}`, {
      headers: { "Authorization": `Bearer ${server.authToken}` },
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<RunningLogData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.data.length)
.toBeGreaterThanOrEqual(2);
    for (const log of body.data) {
      expect(log.workoutId)
.toBe(workoutId);
    }
  });

  it("GET /running-logs/personal-bests — returns fastest pace, longest distance, longest duration", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs/personal-bests`, {
      headers: { "Authorization": `Bearer ${server.authToken}` },
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<PersonalBestsData>;
    expect(body.success)
.toBe(true);
    expect(body.data)
.toHaveProperty("fastestPace");
    expect(body.data)
.toHaveProperty("longestDistance");
    expect(body.data)
.toHaveProperty("longestDuration");
    // Should have values since we created logs
    expect(body.data.fastestPace).not.toBeNull();
    expect(body.data.longestDistance).not.toBeNull();
    expect(body.data.longestDuration).not.toBeNull();
  });

  it("PUT /running-logs/:id — updates distance", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server.authToken}`,
      },
      body: JSON.stringify({ distanceMiles: 5.5 }),
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.success)
.toBe(true);
    expect(body.data.distanceMiles)
.toBe(5.5);
    expect(body.data.id)
.toBe(runningLogId);
  });

  it("DELETE /running-logs/:id — deletes running log", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${server.authToken}` },
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success)
.toBe(true);
    expect(body.data.deleted)
.toBe(true);
  });

  it("GET /running-logs/:id — deleted log returns 404", async () => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      headers: { "Authorization": `Bearer ${server.authToken}` },
    });

    expect(res.status)
.toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });
});
