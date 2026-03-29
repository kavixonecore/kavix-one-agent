import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoClient } from "mongodb";
import { ulid } from "ulidx";

import { RunningLogRepository } from "../running-log.repository.mjs";

import type { IRunningLog } from "../interfaces/index.mjs";

const MONGO_URI = process.env["MONGODB_URI"] ?? "mongodb://admin:password@localhost:27017/fitness_tracker_test?authSource=admin";
const DB_NAME = "fitness_tracker_test";

describe("RunningLogRepository", () => {
  let client: MongoClient;
  let repository: RunningLogRepository;

  beforeAll(async () => {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    repository = new RunningLogRepository(client, DB_NAME);
  });

  afterAll(async () => {
    await client.db(DB_NAME)
.collection("running_logs")
.deleteMany({});
    await client.close();
  });

  beforeEach(async () => {
    await client.db(DB_NAME)
.collection("running_logs")
.deleteMany({});
  });

  const makeLog = (overrides: Partial<IRunningLog> = {}): IRunningLog => ({
    id: ulid(),
    workoutId: "workout-1",
    distanceMiles: 5.0,
    durationMinutes: 40,
    paceMinutesPerMile: 8.0,
    createdAt: new Date()
.toISOString(),
    updatedAt: new Date()
.toISOString(),
    ...overrides,
  });

  it("should create a running log", async () => {
    const log = makeLog();
    const result = await repository.create(log);
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.id)
.toBe(log.id);
    }
  });

  it("should find logs by workoutId", async () => {
    await repository.create(makeLog({ id: ulid(), workoutId: "workout-1" }));
    await repository.create(makeLog({ id: ulid(), workoutId: "workout-2" }));
    const result = await repository.findByWorkoutId("workout-1");
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(1);
    }
  });

  it("should get personal bests", async () => {
    await repository.create(makeLog({ id: ulid(), distanceMiles: 3, durationMinutes: 24, paceMinutesPerMile: 8.0 }));
    await repository.create(makeLog({ id: ulid(), distanceMiles: 10, durationMinutes: 80, paceMinutesPerMile: 8.0 }));
    const result = await repository.getPersonalBests();
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.longestDistance)
.toBe(10);
    }
  });
});
