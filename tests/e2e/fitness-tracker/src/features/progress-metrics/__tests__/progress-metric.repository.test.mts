import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoClient } from "mongodb";
import { ulid } from "ulidx";

import { ProgressMetricRepository } from "../progress-metric.repository.mjs";

import type { IProgressMetric } from "../interfaces/index.mjs";

const MONGO_URI = process.env["MONGODB_URI"] ?? "mongodb://admin:password@localhost:27017/fitness_tracker_test?authSource=admin";
const DB_NAME = "fitness_tracker_test";

describe("ProgressMetricRepository", () => {
  let client: MongoClient;
  let repository: ProgressMetricRepository;

  beforeAll(async () => {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    repository = new ProgressMetricRepository(client, DB_NAME);
  });

  afterAll(async () => {
    await client.db(DB_NAME)
.collection("progress_metrics")
.deleteMany({});
    await client.close();
  });

  beforeEach(async () => {
    await client.db(DB_NAME)
.collection("progress_metrics")
.deleteMany({});
  });

  const makeMetric = (overrides: Partial<IProgressMetric> = {}): IProgressMetric => ({
    id: ulid(),
    metricType: "weight_lbs",
    value: 185,
    unit: "lbs",
    date: "2024-01-15",
    createdAt: new Date()
.toISOString(),
    updatedAt: new Date()
.toISOString(),
    ...overrides,
  });

  it("should create a metric", async () => {
    const metric = makeMetric();
    const result = await repository.create(metric);
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.id)
.toBe(metric.id);
    }
  });

  it("should find all metrics", async () => {
    await repository.create(makeMetric({ id: ulid() }));
    await repository.create(makeMetric({ id: ulid(), metricType: "body_fat_pct", unit: "%" }));
    const result = await repository.findAll({ page: 1, limit: 20 });
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(2);
    }
  });

  it("should find by metric type", async () => {
    await repository.create(makeMetric({ id: ulid(), metricType: "weight_lbs" }));
    await repository.create(makeMetric({ id: ulid(), metricType: "body_fat_pct", unit: "%" }));
    const result = await repository.findByMetricType("weight_lbs");
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(1);
    }
  });

  it("should get latest metrics per type", async () => {
    await repository.create(makeMetric({ id: ulid(), date: "2024-01-01" }));
    await repository.create(makeMetric({ id: ulid(), date: "2024-01-15" }));
    const result = await repository.getLatest();
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(1);
    }
  });
});
