import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoClient } from "mongodb";
import { ulid } from "ulidx";

import { ExerciseRepository } from "../exercise.repository.mjs";

import type { IExercise } from "../interfaces/index.mjs";

const MONGO_URI = process.env["MONGODB_URI"] ?? "mongodb://admin:password@localhost:27017/fitness_tracker_test?authSource=admin";
const DB_NAME = "fitness_tracker_test";

describe("ExerciseRepository", () => {
  let client: MongoClient;
  let repository: ExerciseRepository;

  beforeAll(async () => {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    repository = new ExerciseRepository(client, DB_NAME);
  });

  afterAll(async () => {
    await client.db(DB_NAME)
.collection("exercises")
.deleteMany({});
    await client.close();
  });

  beforeEach(async () => {
    await client.db(DB_NAME)
.collection("exercises")
.deleteMany({});
  });

  const makeExercise = (overrides: Partial<IExercise> = {}): IExercise => ({
    id: ulid(),
    name: "Bench Press",
    description: "A chest exercise",
    muscleGroup: "chest",
    difficultyLevel: "intermediate",
    equipmentRequired: ["barbell", "bench"],
    instructions: "Lie on bench and press",
    createdAt: new Date()
.toISOString(),
    updatedAt: new Date()
.toISOString(),
    ...overrides,
  });

  it("should create an exercise", async () => {
    const exercise = makeExercise();
    const result = await repository.create(exercise);
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.id)
.toBe(exercise.id);
      expect(result.value.name)
.toBe("Bench Press");
    }
  });

  it("should find all exercises", async () => {
    await repository.create(makeExercise({ id: ulid(), name: "Squat", muscleGroup: "legs" }));
    await repository.create(makeExercise({ id: ulid(), name: "Deadlift", muscleGroup: "back" }));
    const result = await repository.findAll({ page: 1, limit: 20 });
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(2);
    }
  });

  it("should filter by muscleGroup", async () => {
    await repository.create(makeExercise({ id: ulid(), muscleGroup: "chest" }));
    await repository.create(makeExercise({ id: ulid(), name: "Squat", muscleGroup: "legs" }));
    const result = await repository.findAll({ muscleGroup: "chest", page: 1, limit: 20 });
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(1);
    }
  });

  it("should find exercise by id", async () => {
    const exercise = makeExercise();
    await repository.create(exercise);
    const result = await repository.findById(exercise.id);
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value?.id)
.toBe(exercise.id);
    }
  });

  it("should return null for nonexistent id", async () => {
    const result = await repository.findById("nonexistent");
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value)
.toBeNull();
    }
  });

  it("should update an exercise", async () => {
    const exercise = makeExercise();
    await repository.create(exercise);
    const result = await repository.update(exercise.id, { name: "Updated Name" });
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value?.name)
.toBe("Updated Name");
    }
  });

  it("should delete an exercise", async () => {
    const exercise = makeExercise();
    await repository.create(exercise);
    const result = await repository.delete(exercise.id);
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value)
.toBe(true);
    }
    const findResult = await repository.findById(exercise.id);
    if (findResult.ok) {
      expect(findResult.value)
.toBeNull();
    }
  });
});
