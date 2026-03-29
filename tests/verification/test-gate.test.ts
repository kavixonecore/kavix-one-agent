import { describe, it, expect, spyOn, afterEach } from "bun:test";

import { runTestGate } from "../../src/verification/test-gate.mjs";

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

describe("runTestGate", () => {
  const spawnSpy = spyOn(Bun, "spawn");

  afterEach(() => {
    spawnSpy.mockReset();
  });

  it("returns passed=true when bun test exits 0 with all passing", async () => {
    const output = "bun test v1.0.0\n5 pass\n0 fail\n";
    spawnSpy.mockReturnValueOnce(makeFakeProc(0, output));

    const result = await runTestGate("/fake/project");

    expect(result.passed)
.toBe(true);
    expect(result.gate)
.toBe("test");
    expect(result.details.passed)
.toBe(5);
    expect(result.details.failed)
.toBe(0);
    expect(result.errors)
.toHaveLength(0);
  });

  it("returns passed=false when bun test exits 1 with failures", async () => {
    const output = "bun test v1.0.0\n3 pass\n2 fail\n✗ should do something\n✗ should do another thing\n";
    spawnSpy.mockReturnValueOnce(makeFakeProc(1, output));

    const result = await runTestGate("/fake/project");

    expect(result.passed)
.toBe(false);
    expect(result.details.passed)
.toBe(3);
    expect(result.details.failed)
.toBe(2);
    expect(result.errors.length)
.toBeGreaterThan(0);
  });

  it("returns passed=false when exit code is non-zero even with no parsed failures", async () => {
    spawnSpy.mockReturnValueOnce(makeFakeProc(1, "Something broke\n"));

    const result = await runTestGate("/fake/project");

    expect(result.passed)
.toBe(false);
    expect(result.errors.length)
.toBeGreaterThan(0);
    expect(result.errors[0])
.toContain("exited with code 1");
  });

  it("returns durationMs >= 0", async () => {
    spawnSpy.mockReturnValueOnce(makeFakeProc(0, "0 pass\n"));

    const result = await runTestGate("/fake/project");

    expect(result.durationMs)
.toBeGreaterThanOrEqual(0);
  });

  it("includes details.total as sum of passed + failed", async () => {
    const output = "7 pass\n2 fail\n";
    spawnSpy.mockReturnValueOnce(makeFakeProc(1, output));

    const result = await runTestGate("/fake/project");

    expect(result.details.total)
.toBe(9);
  });
});
