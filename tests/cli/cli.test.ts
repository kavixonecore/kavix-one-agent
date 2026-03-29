import { describe, it, expect } from "bun:test";

const { parseArgs } = await import("../../src/input/cli.mjs");

describe("parseArgs — generate command extensions", () => {
  it("parses --dry-run flag for generate", () => {
    const result = parseArgs(["generate", "my-project", "--prompt", "Build a thing", "--dry-run"]);
    expect(result.command)
.toBe("generate");
    expect(result.dryRun)
.toBe(true);
    expect(result.prompt)
.toBe("Build a thing");
  });

  it("dryRun defaults to false when not provided", () => {
    const result = parseArgs(["generate", "my-project", "--prompt", "Build a thing"]);
    expect(result.dryRun)
.toBe(false);
  });

  it("throws on unknown flag in generate", () => {
    expect(() =>
      parseArgs(["generate", "my-project", "--prompt", "test", "--unknown-flag"])
    )
.toThrow(/Unknown flag/);
  });
});

describe("parseArgs — trace command", () => {
  it("parses trace with no flags", () => {
    const result = parseArgs(["trace"]);
    expect(result.command)
.toBe("trace");
    expect(result.sessionId)
.toBeUndefined();
    expect(result.useMongo)
.toBeUndefined();
  });

  it("parses trace --session <id>", () => {
    const result = parseArgs(["trace", "--session", "abc123"]);
    expect(result.command)
.toBe("trace");
    expect(result.sessionId)
.toBe("abc123");
  });

  it("parses trace --mongo", () => {
    const result = parseArgs(["trace", "--mongo"]);
    expect(result.command)
.toBe("trace");
    expect(result.useMongo)
.toBe(true);
  });

  it("parses trace --session and --mongo together", () => {
    const result = parseArgs(["trace", "--session", "sess-1", "--mongo"]);
    expect(result.sessionId)
.toBe("sess-1");
    expect(result.useMongo)
.toBe(true);
  });

  it("throws when --session has no value", () => {
    expect(() => parseArgs(["trace", "--session"]))
.toThrow(/--session requires/);
  });

  it("throws on unknown trace flag", () => {
    expect(() => parseArgs(["trace", "--unknown"]))
.toThrow(/Unknown flag/);
  });
});
