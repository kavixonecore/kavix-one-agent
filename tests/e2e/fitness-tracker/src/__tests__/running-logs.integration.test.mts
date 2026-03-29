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

interface RunningLogData {
  readonly id: string;
  readonly workoutId: string;
  readonly distanceMiles: number;
  readonly durationMinutes: number;
  readonly paceMinutesPerMile: number;
  readonly routeName?: string;
  readonly elevationGainFeet?: number;
  readonly heartRateAvg?: number;
  readonly weather?: string;
  readonly notes?: string;
  readonly userId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface PersonalBestsData {
  readonly fastestPace: number | null;
  readonly longestDistance: number | null;
  readonly longestDuration: number | null;
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

describe("Running Logs Integration Tests", () => {
  let server: ITestServer;
  let workoutId: string;
  let runningLogId: string;

  beforeAll(async (): Promise<void> => {
    server = await startTestServer();

    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
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

  afterAll(async (): Promise<void> => {
    await server.cleanup();
  });

  it("GET /running-logs without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs`);
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /running-logs without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutId, distanceMiles: 3, durationMinutes: 30 }),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /running-logs — missing required field distanceMiles returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ workoutId, durationMinutes: 30 }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /running-logs — invalid workoutId returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        workoutId: "01NONEXISTENTWORKOUTID00000",
        distanceMiles: 3.0,
        durationMinutes: 30,
      }),
    });
    // Service wraps not-found as ValidationError → 400
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
  });

  it("POST /running-logs — creates log with valid body and pace, returns 201", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
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
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.success).toBe(true);
    expect(body.data.workoutId).toBe(workoutId);
    expect(body.data.distanceMiles).toBe(5.0);
    expect(body.data.durationMinutes).toBe(45);
    expect(body.data.paceMinutesPerMile).toBe(9.0);
    expect(body.data.routeName).toBe("Park Loop");
    expect(typeof body.data.id).toBe("string");
    runningLogId = body.data.id;
  });

  it("POST /running-logs — without paceMinutesPerMile auto-calculates from duration/distance", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        workoutId,
        distanceMiles: 4.0,
        durationMinutes: 40,
        // paceMinutesPerMile intentionally omitted
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.success).toBe(true);
    // pace = 40 / 4 = 10
    expect(body.data.paceMinutesPerMile).toBe(10);
  });

  it("GET /running-logs — returns 200 with all logs, count >= 1", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<RunningLogData>;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(body.data.some((l) => l.id === runningLogId)).toBe(true);
  });

  it("GET /running-logs/workout/:workoutId — filters by workout, all logs match", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/workout/${workoutId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<RunningLogData>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    for (const log of body.data) {
      expect(log.workoutId).toBe(workoutId);
    }
  });

  it("GET /running-logs/personal-bests — returns 200 with all three fields non-null", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/personal-bests`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<PersonalBestsData>;
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("fastestPace");
    expect(body.data).toHaveProperty("longestDistance");
    expect(body.data).toHaveProperty("longestDuration");
    expect(body.data.fastestPace).not.toBeNull();
    expect(body.data.longestDistance).not.toBeNull();
    expect(body.data.longestDuration).not.toBeNull();
  });

  it("GET /running-logs/:id — returns 200 with matching data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(runningLogId);
    expect(body.data.distanceMiles).toBe(5.0);
  });

  it("GET /running-logs/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/01NONEXISTENTID000000000000`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("PUT /running-logs/:id — updates distance, returns 200 with new data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ distanceMiles: 5.5 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.success).toBe(true);
    expect(body.data.distanceMiles).toBe(5.5);
    expect(body.data.id).toBe(runningLogId);
  });

  it("GET /running-logs/:id — verify distance update persisted", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<RunningLogData>;
    expect(body.data.distanceMiles).toBe(5.5);
  });

  it("PUT /running-logs/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/01NONEXISTENTID000000000000`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ distanceMiles: 3 }),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /running-logs/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/01NONEXISTENTID000000000000`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /running-logs/:id — deletes log, returns 200 with deleted: true", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it("GET /running-logs/:id — deleted log returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/running-logs/${runningLogId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });
});
