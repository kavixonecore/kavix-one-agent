import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface WorkoutData {
  readonly id: string;
  readonly name: string;
  readonly workoutType: string;
  readonly status: string;
  readonly date: string;
  readonly durationMinutes?: number;
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
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0] ?? "2026-03-27";
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0] ?? "2026-03-29";

const authHeaders = (token: string): Record<string, string> => ({
  "Authorization": `Bearer ${token}`,
});

const jsonHeaders = (token: string): Record<string, string> => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

describe("Workouts Integration Tests", () => {
  let server: ITestServer;
  let createdId: string;

  beforeAll(async (): Promise<void> => {
    server = await startTestServer();
  });

  afterAll(async (): Promise<void> => {
    await server.cleanup();
  });

  it("GET /workouts without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts`);
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /workouts without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", workoutType: "running", date: today }),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /workouts — missing workoutType returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ name: "Missing type", date: today }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
  });

  it("POST /workouts — invalid workoutType enum returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ name: "Test", workoutType: "yoga", date: today }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /workouts — status defaults to 'planned' when omitted", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        name: "Status Default Test",
        workoutType: "running",
        date: today,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("planned");
    // cleanup — delete this ephemeral record
    await fetch(`${server.baseUrl}/workouts/${body.data.id}`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
  });

  it("POST /workouts — creates workout with valid body, returns 201", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        name: "Morning Run",
        workoutType: "running",
        status: "planned",
        date: today,
        durationMinutes: 45,
        notes: "Easy pace",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Morning Run");
    expect(body.data.workoutType).toBe("running");
    expect(body.data.status).toBe("planned");
    expect(body.data.durationMinutes).toBe(45);
    expect(typeof body.data.id).toBe("string");
    expect(typeof body.data.createdAt).toBe("string");
    createdId = body.data.id;
  });

  it("GET /workouts — returns 200 with array containing created item", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(body.data.some((w) => w.id === createdId)).toBe(true);
  });

  it("GET /workouts?startDate=...&endDate=... — date range filter includes today's workout", async (): Promise<void> => {
    const res = await fetch(
      `${server.baseUrl}/workouts?startDate=${yesterday}&endDate=${tomorrow}`,
      { headers: authHeaders(server.authToken) },
    );
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.some((w) => w.id === createdId)).toBe(true);
  });

  it("GET /workouts?status=planned — filters to planned workouts only", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts?status=planned`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success).toBe(true);
    for (const workout of body.data) {
      expect(workout.status).toBe("planned");
    }
    expect(body.data.some((w) => w.id === createdId)).toBe(true);
  });

  it("GET /workouts/:id — returns 200 with matching data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdId);
    expect(body.data.name).toBe("Morning Run");
    expect(body.data.workoutType).toBe("running");
  });

  it("GET /workouts/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/01NONEXISTENTID000000000000`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("PUT /workouts/:id — updates status to completed, returns 200", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ status: "completed", durationMinutes: 50 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("completed");
    expect(body.data.durationMinutes).toBe(50);
    expect(body.data.id).toBe(createdId);
  });

  it("GET /workouts/:id — verify status update persisted", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<WorkoutData>;
    expect(body.data.status).toBe("completed");
    expect(body.data.durationMinutes).toBe(50);
  });

  it("GET /workouts?status=completed — shows updated completed workout", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts?status=completed`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<WorkoutData>;
    expect(body.success).toBe(true);
    expect(body.data.some((w) => w.id === createdId)).toBe(true);
  });

  it("PUT /workouts/:id — invalid status enum returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ status: "in_progress" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("PUT /workouts/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/01NONEXISTENTID000000000000`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ status: "completed" }),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /workouts/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/01NONEXISTENTID000000000000`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /workouts/:id — deletes workout, returns 200 with deleted: true", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it("GET /workouts/:id — deleted workout returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/workouts/${createdId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });
});
