import { describe, it, expect, mock, beforeEach } from "bun:test";

import type { ITraceEntry } from "../../src/core/interfaces/index.mjs";

const SAMPLE_ENTRY: ITraceEntry = {
  traceId: "01ABCDEFGHIJKLMNOPQRSTUV",
  sessionId: "session-mongo-test",
  featureName: "user",
  stepName: "schema",
  iteration: 1,
  startedAt: "2026-03-28T10:00:00.000Z",
  completedAt: "2026-03-28T10:00:05.000Z",
  durationMs: 5000,
  status: "success",
  toolUses: [],
  tokenConsumption: { prompt: 500, completion: 250, total: 750 },
  result: {
    filesGenerated: ["src/features/user/validation/user.schema.mts"],
    filesModified: [],
    linesOfCode: 30,
    summary: "Generated user schema",
  },
  errors: [],
  documentation: "",
};

// Mock MongoClient
const mockInsertOne = mock(async () => ({ insertedId: { toString: () => "mock-inserted-id-123" } }));
const mockFind = mock(() => ({
  toArray: mock(async () => [{ ...SAMPLE_ENTRY, _id: "some-id" }]),
}));
const mockCollection = mock(() => ({
  insertOne: mockInsertOne,
  find: mockFind,
}));
const mockDb = mock(() => ({ collection: mockCollection }));
const mockConnect = mock(async () => undefined);
const mockClose = mock(async () => undefined);

mock.module("mongodb", () => ({
  MongoClient: class MockMongoClient {
    public connect = mockConnect;

    public close = mockClose;

    public db = mockDb;
  },
}));

// Import after mocking
const { writeTraceToMongo, getTraces } = await import("../../src/trace/trace-writer-mongo.mjs");

describe("writeTraceToMongo", () => {
  beforeEach(() => {
    mockInsertOne.mockReset();
    mockInsertOne.mockImplementation(async () => ({
      insertedId: { toString: () => "mock-inserted-id-123" },
    }));
  });

  it("returns the inserted document ID as a string", async () => {
    const id = await writeTraceToMongo("mongodb://localhost:27017", "test-db", SAMPLE_ENTRY);

    expect(id)
.toBe("mock-inserted-id-123");
  });

  it("calls insertOne with the trace entry", async () => {
    await writeTraceToMongo("mongodb://localhost:27017", "test-db", SAMPLE_ENTRY);

    expect(mockInsertOne)
.toHaveBeenCalledTimes(1);
  });
});

describe("getTraces", () => {
  beforeEach(() => {
    mockFind.mockReset();
    mockFind.mockReturnValue({
      toArray: mock(async () => [{ ...SAMPLE_ENTRY, _id: "some-id" }]),
    });
  });

  it("returns an array of ITraceEntry objects", async () => {
    const traces = await getTraces("mongodb://localhost:27017", "test-db");

    expect(traces)
.toHaveLength(1);
    expect(traces[0].traceId)
.toBe(SAMPLE_ENTRY.traceId);
  });

  it("filters by sessionId when provided", async () => {
    await getTraces("mongodb://localhost:27017", "test-db", "session-mongo-test");

    expect(mockFind)
.toHaveBeenCalledWith({ sessionId: "session-mongo-test" });
  });

  it("queries all when sessionId is not provided", async () => {
    await getTraces("mongodb://localhost:27017", "test-db");

    expect(mockFind)
.toHaveBeenCalledWith({});
  });

  it("strips _id from returned documents", async () => {
    const traces = await getTraces("mongodb://localhost:27017", "test-db");

    expect("_id" in traces[0])
.toBe(false);
  });
});
