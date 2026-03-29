import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoClient } from "mongodb";
import { ulid } from "ulidx";

import { WorkoutExerciseRepository } from "../workout-exercise.repository.mjs";

import type { IWorkoutExercise } from "../interfaces/index.mjs";

const MONGO_URI = process.env["MONGODB_URI"] ?? "mongodb://admin:password@localhost:27017/fitness_tracker_test?authSource=admin";
const DB_NAME = "fitness_tracker_test";

describe("WorkoutExerciseRepository", () => {
  let client: MongoClient;
  let repository: WorkoutExerciseRepository;

  beforeAll(async () => {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    repository = new WorkoutExerciseRepository(client, DB_NAME);
  });

  afterAll(async () => {
    await client.db(DB_NAME)
.collection("workout_exercises")
.deleteMany({});
    await client.close();
  });

  beforeEach(async () => {
    await client.db(DB_NAME)
.collection("workout_exercises")
.deleteMany({});
  });

  const makeWE = (overrides: Partial<IWorkoutExercise> = {}): IWorkoutExercise => ({
    id: ulid(),
    workoutId: "workout-1",
    exerciseId: "exercise-1",
    order: 1,
    createdAt: new Date()
.toISOString(),
    updatedAt: new Date()
.toISOString(),
    ...overrides,
  });

  it("should create a workout exercise", async () => {
    const we = makeWE();
    const result = await repository.create(we);
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.id)
.toBe(we.id);
    }
  });

  it("should find by workoutId", async () => {
    await repository.create(makeWE({ id: ulid(), workoutId: "workout-1", order: 1 }));
    await repository.create(makeWE({ id: ulid(), workoutId: "workout-2", order: 1 }));
    const result = await repository.findByWorkoutId("workout-1");
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(1);
    }
  });

  it("should order by order field", async () => {
    await repository.create(makeWE({ id: ulid(), order: 3 }));
    await repository.create(makeWE({ id: ulid(), order: 1 }));
    await repository.create(makeWE({ id: ulid(), order: 2 }));
    const result = await repository.findByWorkoutId("workout-1");
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value[0]?.order)
.toBe(1);
      expect(result.value[1]?.order)
.toBe(2);
      expect(result.value[2]?.order)
.toBe(3);
    }
  });
});
