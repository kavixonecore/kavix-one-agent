import { describe, it, expect, mock, beforeEach } from "bun:test";
import { RunningLogService } from "../running-log.service.mjs";
import type { RunningLogRepository } from "../running-log.repository.mjs";
import type { WorkoutService } from "../../workouts/workout.service.mjs";
import { ok, err } from "../../../shared/types/index.mjs";
import { AppError, NotFoundError, ValidationError } from "../../../shared/errors/index.mjs";
import type { IRunningLog } from "../interfaces/index.mjs";
import type { IWorkout } from "../../workouts/interfaces/index.mjs";
import { ulid } from "ulidx";

const makeLog = (overrides: Partial<IRunningLog> = {}): IRunningLog => ({
  id: ulid(),
  workoutId: "workout-1",
  distanceMiles: 5.0,
  durationMinutes: 40,
  paceMinutesPerMile: 8.0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeWorkout = (): IWorkout => ({
  id: "workout-1",
  name: "Morning Run",
  workoutType: "running",
  status: "completed",
  date: "2024-01-15",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const makeMockRepo = (): RunningLogRepository => ({
  create: mock(() => Promise.resolve(ok(makeLog()))),
  findAll: mock(() => Promise.resolve(ok([makeLog()]))),
  findById: mock(() => Promise.resolve(ok(makeLog()))),
  findByWorkoutId: mock(() => Promise.resolve(ok([makeLog()]))),
  getPersonalBests: mock(() => Promise.resolve(ok({ fastestPace: 7.5, longestDistance: 10.0, longestDuration: 80 }))),
  update: mock(() => Promise.resolve(ok(makeLog()))),
  delete: mock(() => Promise.resolve(ok(true))),
  count: mock(() => Promise.resolve(ok(1))),
} as unknown as RunningLogRepository);

const makeMockWorkoutService = (): WorkoutService => ({
  findById: mock(() => Promise.resolve(ok(makeWorkout()))),
} as unknown as WorkoutService);

describe("RunningLogService", () => {
  let mockRepo: RunningLogRepository;
  let mockWorkoutService: WorkoutService;
  let service: RunningLogService;

  beforeEach(() => {
    mockRepo = makeMockRepo();
    mockWorkoutService = makeMockWorkoutService();
    service = new RunningLogService(mockRepo, mockWorkoutService);
  });

  it("should create a running log with pace calculation", async () => {
    const result = await service.create({
      workoutId: "workout-1",
      distanceMiles: 5.0,
      durationMinutes: 40,
    });
    expect(result.ok).toBe(true);
  });

  it("should fail when workoutId does not exist", async () => {
    mockWorkoutService.findById = mock(() => Promise.resolve(err(new NotFoundError("Workout", "bad-id"))));
    const result = await service.create({
      workoutId: "bad-id",
      distanceMiles: 5.0,
      durationMinutes: 40,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it("should compute pace if not provided", async () => {
    let capturedLog: IRunningLog | null = null;
    mockRepo.create = mock((log: IRunningLog) => {
      capturedLog = log;
      return Promise.resolve(ok(log));
    });
    await service.create({
      workoutId: "workout-1",
      distanceMiles: 5.0,
      durationMinutes: 40,
    });
    expect(capturedLog).not.toBeNull();
    if (capturedLog) {
      expect((capturedLog as IRunningLog).paceMinutesPerMile).toBe(8.0);
    }
  });

  it("should get personal bests", async () => {
    const result = await service.getPersonalBests();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.fastestPace).toBe(7.5);
    }
  });

  it("should find by workoutId", async () => {
    const result = await service.findByWorkoutId("workout-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(1);
    }
  });

  it("should return NotFoundError on findById when missing", async () => {
    mockRepo.findById = mock(() => Promise.resolve(ok(null)));
    const result = await service.findById("bad-id");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it("should propagate repo error", async () => {
    mockRepo.findById = mock(() => Promise.resolve(err(new AppError("DB", 500, "DB_ERROR"))));
    const result = await service.findById("id");
    expect(result.ok).toBe(false);
  });
});
