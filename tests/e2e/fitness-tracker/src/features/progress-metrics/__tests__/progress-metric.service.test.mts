import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ProgressMetricService } from "../progress-metric.service.mjs";
import type { ProgressMetricRepository } from "../progress-metric.repository.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { AppError, NotFoundError, ValidationError } from "../../../shared/errors/index.mjs";
import type { IProgressMetric } from "../interfaces/index.mjs";
import { ulid } from "ulidx";

const makeMetric = (overrides: Partial<IProgressMetric> = {}): IProgressMetric => ({
  id: ulid(),
  metricType: "weight_lbs",
  value: 185,
  unit: "lbs",
  date: "2024-01-15",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeMockRepo = (): ProgressMetricRepository => ({
  create: mock(() => Promise.resolve(ok(makeMetric()))),
  findAll: mock(() => Promise.resolve(ok([makeMetric()]))),
  findById: mock(() => Promise.resolve(ok(makeMetric()))),
  findByMetricType: mock(() => Promise.resolve(ok([makeMetric()]))),
  getLatest: mock(() => Promise.resolve(ok([makeMetric()]))),
  update: mock(() => Promise.resolve(ok(makeMetric()))),
  delete: mock(() => Promise.resolve(ok(true))),
  count: mock(() => Promise.resolve(ok(1))),
} as unknown as ProgressMetricRepository);

describe("ProgressMetricService", () => {
  let mockRepo: ProgressMetricRepository;
  let service: ProgressMetricService;

  beforeEach(() => {
    mockRepo = makeMockRepo();
    service = new ProgressMetricService(mockRepo);
  });

  it("should create a metric", async () => {
    const result = await service.create({
      metricType: "weight_lbs",
      value: 185,
      unit: "lbs",
      date: "2024-01-15",
    });
    expect(result.ok).toBe(true);
  });

  it("should return ValidationError when custom metric has no name", async () => {
    const result = await service.create({
      metricType: "custom",
      value: 10,
      unit: "reps",
      date: "2024-01-15",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it("should create custom metric with name", async () => {
    const result = await service.create({
      metricType: "custom",
      value: 10,
      unit: "reps",
      date: "2024-01-15",
      customMetricName: "Pull-ups",
    });
    expect(result.ok).toBe(true);
  });

  it("should get latest metrics", async () => {
    const result = await service.getLatest();
    expect(result.ok).toBe(true);
    expect(mockRepo.getLatest).toHaveBeenCalledTimes(1);
  });

  it("should find by metric type", async () => {
    const result = await service.findByMetricType("weight_lbs");
    expect(result.ok).toBe(true);
  });

  it("should return NotFoundError when metric not found", async () => {
    mockRepo.findById = mock(() => Promise.resolve(ok(null)));
    const result = await service.findById("nonexistent");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it("should propagate repository error", async () => {
    mockRepo.findById = mock(() => Promise.resolve(err(new AppError("DB error", 500, "DB_ERROR"))));
    const result = await service.findById("id");
    expect(result.ok).toBe(false);
  });
});
