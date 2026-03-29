import { describe, it, expect, spyOn, afterEach, mock } from "bun:test";

import { runSmokeGate } from "../../src/verification/smoke-gate.mjs";

function makeFakeProc(exitCode: number, stdout = "", stderr = ""): ReturnType<typeof Bun.spawn> {
  return {
    exited: Promise.resolve(exitCode),
    kill: mock(() => undefined),
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

describe("runSmokeGate", () => {
  const spawnSpy = spyOn(Bun, "spawn");

  afterEach(() => {
    spawnSpy.mockReset();
  });

  it("returns passed=false when docker-compose fails", async () => {
    // docker-compose up exits with error, then docker-compose down for cleanup
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(1)) // docker-compose up (fails)
      .mockReturnValueOnce(makeFakeProc(0)); // docker-compose down (cleanup)

    const result = await runSmokeGate("/fake/project", ["/healthz"]);

    expect(result.passed)
.toBe(false);
    expect(result.gate)
.toBe("smoke");
    expect(result.errors.length)
.toBeGreaterThan(0);
  });

  it("returns gate=smoke in all cases", async () => {
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(1)) // docker-compose up (fails)
      .mockReturnValueOnce(makeFakeProc(0)); // docker-compose down (cleanup)

    const result = await runSmokeGate("/fake/project", []);

    expect(result.gate)
.toBe("smoke");
  });

  it("includes durationMs >= 0 in result on docker-compose failure", async () => {
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(1)) // docker-compose up (fails)
      .mockReturnValueOnce(makeFakeProc(0)); // docker-compose down (cleanup)

    const result = await runSmokeGate("/fake/project", ["/healthz"]);

    expect(result.durationMs)
.toBeGreaterThanOrEqual(0);
  });

  it("returns errors array when docker-compose setup fails", async () => {
    spawnSpy
      .mockReturnValueOnce(makeFakeProc(1)) // docker-compose up (fails)
      .mockReturnValueOnce(makeFakeProc(0)); // docker-compose down (cleanup)

    const result = await runSmokeGate("/fake/project", ["/healthz"]);

    expect(Array.isArray(result.errors))
.toBe(true);
    expect(result.errors.length)
.toBeGreaterThan(0);
  });
});
