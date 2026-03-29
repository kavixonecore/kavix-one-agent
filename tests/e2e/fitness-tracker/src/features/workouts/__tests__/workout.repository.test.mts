import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoClient } from "mongodb";
import { WorkoutRepository } from "../workout.repository.mjs";
import type { IWorkout } from "../interfaces/index.mjs";
import { ulid } from "ulidx";

const MONGO_URI = process.env["MONGODB_URI"] ?? "mongodb://admin:password@localhost:27017/fitness_tracker_test?authSource=admin";
const DB_NAME = "fitness_tracker_test";

describe("WorkoutRepository", () => {
  let client: MongoClient;
  let repository: WorkoutRepository;

  beforeAll(async () => {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    repository = new WorkoutRepository(client, DB_NAME);
  });

  afterAll(async () => {
    await client.db(DB_NAME).collection("workouts").deleteMany({});
    await client.close();
  });

  beforeEach(async () => {
    await client.db(DB_NAME).collection("workouts").deleteMany({});
  });

  const makeWorkout = (overrides: Partial<IWorkout> = {}): IWorkout => ({
    id: ulid(),
    name: "Morning Run",
    workoutType: "running",
    status: "planned",
    date: "2024-01-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it("should create a workout", async () => {
    const workout = makeWorkout();
    const result = await repository.create(workout);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe(workout.id);
    }
  });

  it("should find all workouts", async () => {
    await repository.create(makeWorkout({ id: ulid() }));
    await repository.create(makeWorkout({ id: ulid(), name: "Evening Lift" }));
    const result = await repository.findAll({ page: 1, limit: 20 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(2);
    }
  });

  it("should filter by date range", async () => {
    await repository.create(makeWorkout({ id: ulid(), date: "2024-01-10" }));
    await repository.create(makeWorkout({ id: ulid(), date: "2024-02-10" }));
    const result = await repository.findAll({ startDate: "2024-01-01", endDate: "2024-01-31", page: 1, limit: 20 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(1);
    }
  });

  it("should find workout by id", async () => {
    const workout = makeWorkout();
    await repository.create(workout);
    const result = await repository.findById(workout.id);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value?.id).toBe(workout.id);
    }
  });

  it("should update a workout", async () => {
    const workout = makeWorkout();
    await repository.create(workout);
    const result = await repository.update(workout.id, { name: "Updated Name" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value?.name).toBe("Updated Name");
    }
  });

  it("should delete a workout", async () => {
    const workout = makeWorkout();
    await repository.create(workout);
    const result = await repository.delete(workout.id);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(true);
    }
  });
});
