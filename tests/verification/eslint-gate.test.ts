import { describe, it, expect, spyOn, afterEach } from "bun:test";

import { runEslintGate } from "../../src/verification/eslint-gate.mjs";

// Helper to build a fake Bun.spawn process-like object
function makeFakeProc(exitCode: number, stdout: string, stderr = ""): ReturnType<typeof Bun.spawn> {
  return {
    exited: Promise.resolve(exitCode),
    stdout: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder()
.encode(stdout));
        controller.close();
      },
    }),
    stderr: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder()
.encode(stderr));
        controller.close();
      },
    }),
  } as unknown as ReturnType<typeof Bun.spawn>;
}

describe("runEslintGate", () => {
  const spawnSpy = spyOn(Bun, "spawn");

  afterEach(() => {
    spawnSpy.mockReset();
  });

  it("returns passed=true when eslint exits 0 with no errors", async () => {
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(0, "")) // fix run
      .mockReturnValueOnce(makeFakeProc(0, "")); // check run

    const result = await runEslintGate("/fake/project");

    expect(result.passed)
.toBe(true);
    expect(result.gate)
.toBe("eslint");
    expect(result.errors)
.toHaveLength(0);
    expect(result.warnings)
.toHaveLength(0);
  });

  it("returns passed=false when eslint exits non-zero with error lines", async () => {
    const errorOutput = "/fake/project/src/foo.mts: line 5, col 3, error - Missing return type (explicit-function-return-type)";
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(0, "")) // fix run
      .mockReturnValueOnce(makeFakeProc(1, errorOutput)); // check run

    const result = await runEslintGate("/fake/project");

    expect(result.passed)
.toBe(false);
    expect(result.errors.length)
.toBeGreaterThan(0);
    expect(result.errors[0])
.toContain("error");
  });

  it("captures warnings separately from errors", async () => {
    const warnOutput = "/fake/project/src/foo.mts: line 3, col 1, warning - Unused variable (no-unused-vars)";
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(0, "")) // fix run
      .mockReturnValueOnce(makeFakeProc(0, warnOutput)); // check run (exit 0 for warnings only)

    const result = await runEslintGate("/fake/project");

    expect(result.warnings.length)
.toBeGreaterThan(0);
    expect(result.warnings[0])
.toContain("warning");
  });

  it("returns durationMs >= 0", async () => {
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(0, ""))
      .mockReturnValueOnce(makeFakeProc(0, ""));

    const result = await runEslintGate("/fake/project");

    expect(result.durationMs)
.toBeGreaterThanOrEqual(0);
  });
});
