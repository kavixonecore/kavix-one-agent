import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ExerciseService } from "../exercise.service.mjs";
import type { ExerciseRepository } from "../exercise.repository.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { AppError, NotFoundError } from "../../../shared/errors/index.mjs";
import type { IExercise } from "../interfaces/index.mjs";
import { ulid } from "ulidx";

const makeExercise = (overrides: Partial<IExercise> = {}): IExercise => ({
  id: ulid(),
  name: "Bench Press",
  description: "A chest exercise",
  muscleGroup: "chest",
  difficultyLevel: "intermediate",
  equipmentRequired: [],
  instructions: "Press it",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeMockRepo = (): ExerciseRepository => ({
  create: mock(() => Promise.resolve(ok(makeExercise()))),
  findAll: mock(() => Promise.resolve(ok([makeExercise()]))),
  findById: mock(() => Promise.resolve(ok(makeExercise()))),
  update: mock(() => Promise.resolve(ok(makeExercise()))),
  delete: mock(() => Promise.resolve(ok(true))),
  count: mock(() => Promise.resolve(ok(1))),
} as unknown as ExerciseRepository);

describe("ExerciseService", () => {
  let mockRepo: ExerciseRepository;
  let service: ExerciseService;

  beforeEach(() => {
    mockRepo = makeMockRepo();
    service = new ExerciseService(mockRepo);
  });

  it("should create an exercise with ULID id", async () => {
    const data = {
      name: "Squat",
      description: "A leg exercise",
      muscleGroup: "legs" as const,
      difficultyLevel: "beginner" as const,
      equipmentRequired: [],
      instructions: "Squat down",
    };
    const result = await service.create(data);
    expect(result.ok).toBe(true);
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });

  it("should return list with count", async () => {
    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.count).toBe(1);
      expect(result.value.data.length).toBe(1);
    }
  });

  it("should return NotFoundError when exercise not found by id", async () => {
    mockRepo.findById = mock(() => Promise.resolve(ok(null)));
    const result = await service.findById("nonexistent");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it("should propagate repository error on findById", async () => {
    mockRepo.findById = mock(() => Promise.resolve(err(new AppError("DB error", 500, "DB_ERROR"))));
    const result = await service.findById("id");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("DB error");
    }
  });

  it("should return NotFoundError on update when not found", async () => {
    mockRepo.findById = mock(() => Promise.resolve(ok(null)));
    const result = await service.update("id", { name: "New Name" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it("should return NotFoundError on delete when not found", async () => {
    mockRepo.findById = mock(() => Promise.resolve(ok(null)));
    const result = await service.delete("id");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });
});
