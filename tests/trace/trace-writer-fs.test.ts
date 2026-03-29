import { join } from "path";

import { describe, it, expect, afterEach } from "bun:test";

import { writeTraceToFs } from "../../src/trace/trace-writer-fs.mjs";

import type { ITraceEntry } from "../../src/core/interfaces/index.mjs";

const TMP_DIR = join(import.meta.dir, "__tmp_trace_fs");

const SAMPLE_ENTRY: ITraceEntry = {
  traceId: "01ABCDEFGHIJKLMNOPQRSTUV",
  sessionId: "session-test",
  featureName: "user",
  stepName: "interfaces",
  iteration: 1,
  startedAt: "2026-03-28T10:00:00.000Z",
  completedAt: "2026-03-28T10:00:05.000Z",
  durationMs: 5000,
  status: "success",
  toolUses: [
    { toolName: "Read", callCount: 3, totalDurationMs: 300 },
    { toolName: "Write", callCount: 2, totalDurationMs: 200 },
  ],
  tokenConsumption: { prompt: 1000, completion: 500, total: 1500 },
  result: {
    filesGenerated: ["src/features/user/interfaces/i-user.mts"],
    filesModified: [],
    linesOfCode: 20,
    summary: "Generated user interface files",
  },
  errors: [],
  documentation: "User feature interfaces generated successfully.",
};

afterEach(async () => {
  // Clean up temp files
  const docsDir = join(TMP_DIR, ".docs");
  const glob = new Bun.Glob("*.md");
  try {
    for await (const file of glob.scan(docsDir)) {
      await Bun.file(join(docsDir, file))
.unlink?.();
    }
  } catch {
    // ignore cleanup errors
  }
});

describe("writeTraceToFs", () => {
  it("writes a markdown file and returns the file path", async () => {
    const filePath = await writeTraceToFs(TMP_DIR, SAMPLE_ENTRY);

    expect(filePath)
.toContain("interfaces-1.md");
    const file = Bun.file(filePath);
    expect(await file.exists())
.toBe(true);
  });

  it("markdown contains the step name and iteration", async () => {
    const filePath = await writeTraceToFs(TMP_DIR, SAMPLE_ENTRY);
    const content = await Bun.file(filePath)
.text();

    expect(content)
.toContain("interfaces");
    expect(content)
.toContain("iteration 1");
  });

  it("markdown contains token consumption table", async () => {
    const filePath = await writeTraceToFs(TMP_DIR, SAMPLE_ENTRY);
    const content = await Bun.file(filePath)
.text();

    expect(content)
.toContain("Token Consumption");
    expect(content)
.toContain("1500");
  });

  it("markdown contains tool uses table", async () => {
    const filePath = await writeTraceToFs(TMP_DIR, SAMPLE_ENTRY);
    const content = await Bun.file(filePath)
.text();

    expect(content)
.toContain("Tool Uses");
    expect(content)
.toContain("Read");
    expect(content)
.toContain("Write");
  });

  it("markdown includes files generated list", async () => {
    const filePath = await writeTraceToFs(TMP_DIR, SAMPLE_ENTRY);
    const content = await Bun.file(filePath)
.text();

    expect(content)
.toContain("i-user.mts");
  });

  it("uses stepName-iteration.md as filename", async () => {
    const entry: ITraceEntry = { ...SAMPLE_ENTRY, stepName: "schema", iteration: 3 };
    const filePath = await writeTraceToFs(TMP_DIR, entry);

    expect(filePath)
.toMatch(/schema-3\.md$/);
  });

  it("renders errors section when errors exist", async () => {
    const entry: ITraceEntry = {
      ...SAMPLE_ENTRY,
      stepName: "error-step",
      iteration: 1,
      errors: [{ message: "Test error occurred", file: "src/foo.mts", context: {} }],
    };
    const filePath = await writeTraceToFs(TMP_DIR, entry);
    const content = await Bun.file(filePath)
.text();

    expect(content)
.toContain("Errors");
    expect(content)
.toContain("Test error occurred");
  });
});
