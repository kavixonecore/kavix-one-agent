import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { createProgressMetricRouter } from "../progress-metric.router.mjs";
import type { ProgressMetricService } from "../progress-metric.service.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { NotFoundError } from "../../../shared/errors/index.mjs";
import type { IProgressMetric } from "../interfaces/index.mjs";
import { ulid } from "ulidx";
import winston from "winston";

const testLogger = winston.createLogger({ silent: true });

const makeMetric = (): IProgressMetric => ({
  id: ulid(),
  metricType: "weight_lbs",
  value: 185,
  unit: "lbs",
  date: "2024-01-15",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const makeMockService = (): ProgressMetricService => ({
  create: mock(() => Promise.resolve(ok(makeMetric()))),
  findAll: mock(() => Promise.resolve(ok({ data: [makeMetric()], count: 1 }))),
  findById: mock(() => Promise.resolve(ok(makeMetric()))),
  findByMetricType: mock(() => Promise.resolve(ok([makeMetric()]))),
  getLatest: mock(() => Promise.resolve(ok([makeMetric()]))),
  update: mock(() => Promise.resolve(ok(makeMetric()))),
  delete: mock(() => Promise.resolve(ok(true))),
} as unknown as ProgressMetricService);

const buildApp = (service: ProgressMetricService): Elysia => {
  return new Elysia().use(createProgressMetricRouter(testLogger, service)) as unknown as Elysia;
};

describe("ProgressMetricRouter", () => {
  let mockService: ProgressMetricService;
  let app: Elysia;

  beforeEach(() => {
    mockService = makeMockService();
    app = buildApp(mockService);
  });

  it("POST /progress-metrics should create metric and return 201", async () => {
    const res = await app.handle(
      new Request("http://localhost/progress-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricType: "weight_lbs",
          value: 185,
          unit: "lbs",
          date: "2024-01-15",
        }),
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it("GET /progress-metrics should return list", async () => {
    const res = await app.handle(new Request("http://localhost/progress-metrics"));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; count: number };
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });

  it("GET /progress-metrics/latest should return latest metrics", async () => {
    const res = await app.handle(new Request("http://localhost/progress-metrics/latest"));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it("GET /progress-metrics/by-type/:metricType should return metrics by type", async () => {
    const res = await app.handle(new Request("http://localhost/progress-metrics/by-type/weight_lbs"));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it("GET /progress-metrics/:id should return metric", async () => {
    const res = await app.handle(new Request("http://localhost/progress-metrics/some-id"));
    expect(res.status).toBe(200);
  });

  it("GET /progress-metrics/:id should return 404 when not found", async () => {
    mockService.findById = mock(() => Promise.resolve(err(new NotFoundError("ProgressMetric", "id"))));
    app = buildApp(mockService);
    const res = await app.handle(new Request("http://localhost/progress-metrics/nonexistent"));
    expect(res.status).toBe(404);
  });

  it("DELETE /progress-metrics/:id should delete metric", async () => {
    const res = await app.handle(
      new Request("http://localhost/progress-metrics/some-id", { method: "DELETE" }),
    );
    expect(res.status).toBe(200);
  });
});
