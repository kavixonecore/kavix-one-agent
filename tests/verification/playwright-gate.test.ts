import { describe, it, expect, mock, beforeEach } from "bun:test";

import { runPlaywrightGate } from "../../src/verification/playwright-gate.mjs";

describe("playwright-gate", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("passes when swagger page returns 200 with OpenAPI content", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => new Response(
      "<html><body>scalar openapi swagger</body></html>",
      { status: 200 }
    ));

    const result = await runPlaywrightGate("http://localhost:3000", ".docs");

    expect(result.passed)
.toBe(true);
    expect(result.errors)
.toHaveLength(0);

    globalThis.fetch = originalFetch;
  });

  it("fails when swagger page returns non-200", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => new Response("Not Found", { status: 404 }));

    const result = await runPlaywrightGate("http://localhost:3000", ".docs");

    expect(result.passed)
.toBe(false);
    expect(result.errors[0])
.toContain("404");

    globalThis.fetch = originalFetch;
  });

  it("fails when page does not contain OpenAPI content", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => new Response(
      "<html><body>Hello world</body></html>",
      { status: 200 }
    ));

    const result = await runPlaywrightGate("http://localhost:3000", ".docs");

    expect(result.passed)
.toBe(false);
    expect(result.errors[0])
.toContain("OpenAPI content");

    globalThis.fetch = originalFetch;
  });

  it("fails when fetch throws", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      throw new Error("Connection refused");
    });

    const result = await runPlaywrightGate("http://localhost:3000", ".docs");

    expect(result.passed)
.toBe(false);
    expect(result.errors[0])
.toContain("Connection refused");

    globalThis.fetch = originalFetch;
  });
});
