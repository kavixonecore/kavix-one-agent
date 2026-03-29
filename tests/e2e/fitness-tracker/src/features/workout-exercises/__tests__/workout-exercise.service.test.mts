import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ulid } from "ulidx";

import { WorkoutExerciseService } from "../workout-exercise.service.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { AppError, NotFoundError, ValidationError } from "../../../shared/errors/index.mjs";

import type { WorkoutExerciseRepository } from "../workout-exercise.repository.mjs";
import type { WorkoutService } from "../../workouts/workout.service.mjs";
import type { ExerciseService } from "../../exercises/exercise.service.mjs";
import type { IWorkoutExercise } from "../interfaces/index.mjs";
import type { IWorkout } from "../../workouts/interfaces/index.mjs";
import type { IExercise } from "../../exercises/interfaces/index.mjs";

const makeWorkoutExercise = (overrides: Partial<IWorkoutExercise> = {}): IWorkoutExercise => ({
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

const makeWorkout = (): IWorkout => ({
  id: "workout-1",
  name: "Leg Day",
  workoutType: "weightlifting",
  status: "planned",
  date: "2024-01-15",
  createdAt: new Date()
.toISOString(),
  updatedAt: new Date()
.toISOString(),
});

const makeExercise = (): IExercise => ({
  id: "exercise-1",
  name: "Squat",
  description: "Leg exercise",
  muscleGroup: "legs",
  difficultyLevel: "intermediate",
  equipmentRequired: ["barbell"],
  instructions: "Squat down",
  createdAt: new Date()
.toISOString(),
  updatedAt: new Date()
.toISOString(),
});

const makeMockRepo = (): WorkoutExerciseRepository => ({
  create: mock(() => Promise.resolve(ok(makeWorkoutExercise()))),
  findAll: mock(() => Promise.resolve(ok([makeWorkoutExercise()]))),
  findById: mock(() => Promise.resolve(ok(makeWorkoutExercise()))),
  findByWorkoutId: mock(() => Promise.resolve(ok([makeWorkoutExercise()]))),
  update: mock(() => Promise.resolve(ok(makeWorkoutExercise()))),
  delete: mock(() => Promise.resolve(ok(true))),
  count: mock(() => Promise.resolve(ok(1))),
} as unknown as WorkoutExerciseRepository);

const makeMockWorkoutService = (): WorkoutService => ({
  findById: mock(() => Promise.resolve(ok(makeWorkout()))),
} as unknown as WorkoutService);

const makeMockExerciseService = (): ExerciseService => ({
  findById: mock(() => Promise.resolve(ok(makeExercise()))),
} as unknown as ExerciseService);

describe("WorkoutExerciseService", () => {
  let mockRepo: WorkoutExerciseRepository;
  let mockWorkoutService: WorkoutService;
  let mockExerciseService: ExerciseService;
  let service: WorkoutExerciseService;

  beforeEach(() => {
    mockRepo = makeMockRepo();
    mockWorkoutService = makeMockWorkoutService();
    mockExerciseService = makeMockExerciseService();
    service = new WorkoutExerciseService(mockRepo, mockWorkoutService, mockExerciseService);
  });

  it("should create a workout exercise", async () => {
    const result = await service.create({
      workoutId: "workout-1",
      exerciseId: "exercise-1",
      order: 1,
    });
    expect(result.ok)
.toBe(true);
  });

  it("should fail when workoutId does not exist", async () => {
    mockWorkoutService.findById = mock(() => Promise.resolve(err(new NotFoundError("Workout", "bad-id"))));
    const result = await service.create({
      workoutId: "bad-id",
      exerciseId: "exercise-1",
      order: 1,
    });
    expect(result.ok)
.toBe(false);
    if (!result.ok) {
      expect(result.error)
.toBeInstanceOf(ValidationError);
    }
  });

  it("should fail when exerciseId does not exist", async () => {
    mockExerciseService.findById = mock(() => Promise.resolve(err(new NotFoundError("Exercise", "bad-id"))));
    const result = await service.create({
      workoutId: "workout-1",
      exerciseId: "bad-id",
      order: 1,
    });
    expect(result.ok)
.toBe(false);
    if (!result.ok) {
      expect(result.error)
.toBeInstanceOf(ValidationError);
    }
  });

  it("should find by workoutId", async () => {
    const result = await service.findByWorkoutId("workout-1");
    expect(result.ok)
.toBe(true);
    if (result.ok) {
      expect(result.value.length)
.toBe(1);
    }
  });

  it("should return NotFoundError on findById when missing", async () => {
    mockRepo.findById = mock(() => Promise.resolve(ok(null)));
    const result = await service.findById("bad-id");
    expect(result.ok)
.toBe(false);
    if (!result.ok) {
      expect(result.error)
.toBeInstanceOf(NotFoundError);
    }
  });

  it("should propagate repo error", async () => {
    mockRepo.findById = mock(() => Promise.resolve(err(new AppError("DB", 500, "DB_ERROR"))));
    const result = await service.findById("id");
    expect(result.ok)
.toBe(false);
  });
});
