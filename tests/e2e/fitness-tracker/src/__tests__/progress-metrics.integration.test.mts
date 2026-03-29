import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { startTestServer } from "./helpers/test-server.mjs";

import type { ITestServer } from "./helpers/test-server.mjs";

interface ProgressMetricData {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  date: string;
  customMetricName?: string;
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

describe("Progress Metrics Integration Tests", () => {
  let server: ITestServer;
  let weightMetricId: string;
  let customMetricId: string;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.cleanup();
  });

  it("POST /progress-metrics — creates weight entry, returns 201", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metricType: "weight_lbs",
        value: 185.5,
        unit: "lbs",
        date: today,
        notes: "Morning weigh-in",
      }),
    });

    expect(res.status)
.toBe(201);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.success)
.toBe(true);
    expect(body.data.metricType)
.toBe("weight_lbs");
    expect(body.data.value)
.toBe(185.5);
    expect(body.data.unit)
.toBe("lbs");
    expect(typeof body.data.id)
.toBe("string");

    weightMetricId = body.data.id;
  });

  it("POST /progress-metrics — creates custom metric with customMetricName, returns 201", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metricType: "custom",
        value: 42,
        unit: "reps",
        date: today,
        customMetricName: "Pull-up Max",
      }),
    });

    expect(res.status)
.toBe(201);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.success)
.toBe(true);
    expect(body.data.metricType)
.toBe("custom");
    expect(body.data.customMetricName)
.toBe("Pull-up Max");

    customMetricId = body.data.id;
  });

  it("POST /progress-metrics — custom metric without customMetricName returns 400", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metricType: "custom",
        value: 10,
        unit: "count",
        date: today,
      }),
    });

    expect(res.status)
.toBe(400);
    const body = await res.json() as ErrorResponse;
    expect(body.success)
.toBe(false);
  });

  it("GET /progress-metrics — returns list of all metrics", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.count)
.toBeGreaterThanOrEqual(2);
  });

  it("GET /progress-metrics/latest — returns latest of each type", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/latest`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.count)
.toBeGreaterThanOrEqual(1);
  });

  it("GET /progress-metrics/by-type/weight_lbs — filters by metric type", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/by-type/weight_lbs`);

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.data.length)
.toBeGreaterThanOrEqual(1);
    for (const metric of body.data) {
      expect(metric.metricType)
.toBe("weight_lbs");
    }
  });

  it("GET /progress-metrics/by-type/weight_lbs?startDate=...&endDate=... — with date range", async () => {
    const res = await fetch(
      `${server.baseUrl}/progress-metrics/by-type/weight_lbs?startDate=${yesterday}&endDate=${tomorrow}`
    );

    expect(res.status)
.toBe(200);
    const body = await res.json() as ListResponse<ProgressMetricData>;
    expect(body.success)
.toBe(true);
    expect(Array.isArray(body.data))
.toBe(true);
    expect(body.data.length)
.toBeGreaterThanOrEqual(1);
  });

  it("PUT /progress-metrics/:id — updates value", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${weightMetricId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: 183.0 }),
    });

    expect(res.status)
.toBe(200);
    const body = await res.json() as SuccessResponse<ProgressMetricData>;
    expect(body.success)
.toBe(true);
    expect(body.data.value)
.toBe(183.0);
    expect(body.data.id)
.toBe(weightMetricId);
  });

  it("DELETE /progress-metrics/:id — deletes weight metric", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${weightMetricId}`, {
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

  it("DELETE /progress-metrics/:id — deletes custom metric", async () => {
    const res = await fetch(`${server.baseUrl}/progress-metrics/${customMetricId}`, {
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
});
