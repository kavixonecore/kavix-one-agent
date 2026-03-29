import { describe, it, expect } from "bun:test";

const { parseArgs } = await import("../../src/input/cli.mjs");

describe("trace command parsing", () => {
  it("parses bare trace command", () => {
    const cmd = parseArgs(["trace"]);
    expect(cmd.command)
.toBe("trace");
    expect(cmd.sessionId)
.toBeUndefined();
    expect(cmd.useMongo)
.toBeUndefined();
  });

  it("parses trace --session id", () => {
    const cmd = parseArgs(["trace", "--session", "session-001"]);
    expect(cmd.sessionId)
.toBe("session-001");
  });

  it("parses trace --mongo flag", () => {
    const cmd = parseArgs(["trace", "--mongo"]);
    expect(cmd.useMongo)
.toBe(true);
  });

  it("parses trace --session and --mongo together", () => {
    const cmd = parseArgs(["trace", "--mongo", "--session", "sess-42"]);
    expect(cmd.useMongo)
.toBe(true);
    expect(cmd.sessionId)
.toBe("sess-42");
  });

  it("throws when --session is missing its value", () => {
    expect(() => parseArgs(["trace", "--session"]))
.toThrow("--session requires a session ID value");
  });

  it("throws on unknown flag", () => {
    expect(() => parseArgs(["trace", "--verbose"]))
.toThrow("Unknown flag");
  });
});
