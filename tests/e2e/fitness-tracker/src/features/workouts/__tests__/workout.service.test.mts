import { describe, it, expect, mock, beforeEach } from "bun:test";
import { WorkoutService } from "../workout.service.mjs";
import type { WorkoutRepository } from "../workout.repository.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { AppError, NotFoundError } from "../../../shared/errors/index.mjs";
import type { IWorkout } from "../interfaces/index.mjs";
import { ulid } from "ulidx";

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

const makeMockRepo = (): WorkoutRepository => ({
  create: mock(() => Promise.resolve(ok(makeWorkout()))),
  findAll: mock(() => Promise.resolve(ok([makeWorkout()]))),
  findById: mock(() => Promise.resolve(ok(makeWorkout()))),
  update: mock(() => Promise.resolve(ok(makeWorkout()))),
  delete: mock(() => Promise.resolve(ok(true))),
  count: mock(() => Promise.resolve(ok(1))),
} as unknown as WorkoutRepository);

describe("WorkoutService", () => {
  let mockRepo: WorkoutRepository;
  let service: WorkoutService;

  beforeEach(() => {
    mockRepo = makeMockRepo();
    service = new WorkoutService(mockRepo);
  });

  it("should create a workout with ULID id", async () => {
    const data = {
      name: "Leg Day",
      workoutType: "weightlifting" as const,
      status: "planned" as const,
      date: "2024-01-15",
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

  it("should return NotFoundError when workout not found by id", async () => {
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
    const result = await service.update("id", { name: "Updated" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it("should delete workout successfully", async () => {
    const result = await service.delete("some-id");
    expect(result.ok).toBe(true);
  });
});
