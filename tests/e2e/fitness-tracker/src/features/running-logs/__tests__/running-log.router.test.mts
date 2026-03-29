import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { ulid } from "ulidx";
import winston from "winston";

import { createRunningLogRouter } from "../running-log.router.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { NotFoundError } from "../../../shared/errors/index.mjs";

import type { RunningLogService } from "../running-log.service.mjs";
import type { IRunningLog } from "../interfaces/index.mjs";

const testLogger = winston.createLogger({ silent: true });

const makeLog = (): IRunningLog => ({
  id: ulid(),
  workoutId: "workout-1",
  distanceMiles: 5.0,
  durationMinutes: 40,
  paceMinutesPerMile: 8.0,
  createdAt: new Date()
.toISOString(),
  updatedAt: new Date()
.toISOString(),
});

const makeMockService = (): RunningLogService => ({
  create: mock(() => Promise.resolve(ok(makeLog()))),
  findAll: mock(() => Promise.resolve(ok({ data: [makeLog()], count: 1 }))),
  findById: mock(() => Promise.resolve(ok(makeLog()))),
  findByWorkoutId: mock(() => Promise.resolve(ok([makeLog()]))),
  getPersonalBests: mock(() => Promise.resolve(ok({ fastestPace: 7.5, longestDistance: 10.0, longestDuration: 80 }))),
  update: mock(() => Promise.resolve(ok(makeLog()))),
  delete: mock(() => Promise.resolve(ok(true))),
} as unknown as RunningLogService);

const buildApp = (service: RunningLogService): Elysia => {
  return new Elysia()
.use(createRunningLogRouter(testLogger, service)) as unknown as Elysia;
};

describe("RunningLogRouter", () => {
  let mockService: RunningLogService;
  let app: Elysia;

  beforeEach(() => {
    mockService = makeMockService();
    app = buildApp(mockService);
  });

  it("POST /running-logs should create log and return 201", async () => {
    const res = await app.handle(
      new Request("http://localhost/running-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: "workout-1",
          distanceMiles: 5.0,
          durationMinutes: 40,
        }),
      })
    );
    expect(res.status)
.toBe(201);
    const body = await res.json() as { success: boolean };
    expect(body.success)
.toBe(true);
  });

  it("POST /running-logs should return 400 on validation error", async () => {
    const res = await app.handle(
      new Request("http://localhost/running-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: "" }),
      })
    );
    expect(res.status)
.toBe(400);
  });

  it("GET /running-logs should return list", async () => {
    const res = await app.handle(new Request("http://localhost/running-logs"));
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean; count: number };
    expect(body.success)
.toBe(true);
    expect(body.count)
.toBe(1);
  });

  it("GET /running-logs/personal-bests should return bests", async () => {
    const res = await app.handle(new Request("http://localhost/running-logs/personal-bests"));
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean; data: { fastestPace: number } };
    expect(body.success)
.toBe(true);
    expect(body.data.fastestPace)
.toBe(7.5);
  });

  it("GET /running-logs/workout/:workoutId should return logs", async () => {
    const res = await app.handle(new Request("http://localhost/running-logs/workout/workout-1"));
    expect(res.status)
.toBe(200);
    const body = await res.json() as { success: boolean; count: number };
    expect(body.success)
.toBe(true);
    expect(body.count)
.toBe(1);
  });

  it("GET /running-logs/:id should return 404 when not found", async () => {
    mockService.findById = mock(() => Promise.resolve(err(new NotFoundError("RunningLog", "id"))));
    app = buildApp(mockService);
    const res = await app.handle(new Request("http://localhost/running-logs/nonexistent"));
    expect(res.status)
.toBe(404);
  });

  it("DELETE /running-logs/:id should delete log", async () => {
    const res = await app.handle(
      new Request("http://localhost/running-logs/some-id", { method: "DELETE" })
    );
    expect(res.status)
.toBe(200);
  });
});
