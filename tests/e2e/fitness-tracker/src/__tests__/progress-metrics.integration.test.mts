import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface ProgressMetricData {
  readonly id: string;
  readonly metricType: string;
  readonly value: number;
  readonly unit: string;
  readonly date: string;
  readonly customMetricName?: string;
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

describe("Progress Metrics Integration Tests", () => {
  let server: ITestServer;
  let weightMetricId: string;
  let customMetricId: string;

  beforeAll(async (): Promise<void> => {
    server = await startTestServer();
  });

  afterAll(async (): Promise<void> => {
    await server.cleanup();
  });

  it("GET /progress-metrics without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`);
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /progress-metrics without auth token — returns 401", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metricType: "weight_lbs", value: 180, unit: "lbs", date: today }),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /progress-metrics — missing required field value returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ metricType: "weight_lbs", unit: "lbs", date: today }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /progress-metrics — invalid metricType enum returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ metricType: "pushup_count", value: 50, unit: "reps", date: today }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("POST /progress-metrics — custom metric without customMetricName returns 400", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ metricType: "custom", value: 10, unit: "count", date: today }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
  });

  it("POST /progress-metrics — creates weight_lbs metric, returns 201", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        metricType: "weight_lbs",
        value: 185.5,
        unit: "lbs",
        date: today,
        notes: "Morning weigh-in",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(body.data.metricType).toBe("weight_lbs");
    expect(body.data.value).toBe(185.5);
    expect(body.data.unit).toBe("lbs");
    expect(body.data.notes).toBe("Morning weigh-in");
    expect(typeof body.data.id).toBe("string");
    weightMetricId = body.data.id;
  });

  it("POST /progress-metrics — creates custom metric with customMetricName, returns 201", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({
        metricType: "custom",
        value: 42,
        unit: "reps",
        date: today,
        customMetricName: "Pull-up Max",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(body.data.metricType).toBe("custom");
    expect(body.data.customMetricName).toBe("Pull-up Max");
    expect(body.data.value).toBe(42);
    customMetricId = body.data.id;
  });

  it("GET /progress-metrics — returns 200 with all metrics, count >= 2", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(2);
    expect(body.data.some((m) => m.id === weightMetricId)).toBe(true);
    expect(body.data.some((m) => m.id === customMetricId)).toBe(true);
  });

  it("GET /progress-metrics/latest — returns 200 with most recent of each type", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/latest`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
    // Each type should appear at most once
    const types = body.data.map((m) => m.metricType);
    const uniqueTypes = new Set(types);
    expect(uniqueTypes.size).toBe(types.length);
  });

  it("GET /progress-metrics/by-type/weight_lbs — filters to weight_lbs only", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/by-type/weight_lbs`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    for (const metric of body.data) {
      expect(metric.metricType).toBe("weight_lbs");
    }
  });

  it("GET /progress-metrics/by-type/weight_lbs?startDate=...&endDate=... — date range filter", async (): Promise<void> => {
    const res = await fetch(
      `${server.baseUrl}/progress-metrics/by-type/weight_lbs?startDate=${yesterday}&endDate=${tomorrow}`,
      { headers: authHeaders(server.authToken) },
    );
    expect(res.status).toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /progress-metrics/:id — returns 200 with weight metric data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${weightMetricId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(weightMetricId);
    expect(body.data.value).toBe(185.5);
  });

  it("GET /progress-metrics/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/01NONEXISTENTID000000000000`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("PUT /progress-metrics/:id — updates value, returns 200 with new data", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${weightMetricId}`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ value: 183.0 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.success).toBe(true);
    expect(body.data.value).toBe(183.0);
    expect(body.data.id).toBe(weightMetricId);
  });

  it("GET /progress-metrics/:id — verify value update persisted", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${weightMetricId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.data.value).toBe(183.0);
  });

  it("PUT /progress-metrics/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/01NONEXISTENTID000000000000`, {
      method: "PUT",
      headers: jsonHeaders(server.authToken),
      body: JSON.stringify({ value: 180 }),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /progress-metrics/:id — nonexistent ID returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/01NONEXISTENTID000000000000`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /progress-metrics/:id — deletes weight metric, returns 200 deleted: true", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${weightMetricId}`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it("GET /progress-metrics/:id — deleted metric returns 404", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${weightMetricId}`, {
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    expect(body.success).toBe(false);
  });

  it("DELETE /progress-metrics/:id — deletes custom metric, returns 200 deleted: true", async (): Promise<void> => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${customMetricId}`, {
      method: "DELETE",
      headers: authHeaders(server.authToken),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as SuccessResponse<{ deleted: boolean }>;
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });
});
