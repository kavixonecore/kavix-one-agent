import { describe, it, expect } from "bun:test";

const { parseArgs } = await import("../../src/input/cli.mjs");

describe("CLI --dry-run flag", () => {
  it("sets dryRun=true when --dry-run is passed", () => {
    const result = parseArgs(["generate", "my-api", "--prompt", "Build a REST API", "--dry-run"]);
    expect(result.dryRun)
.toBe(true);
  });

  it("sets dryRun=false by default", () => {
    const result = parseArgs(["generate", "my-api", "--prompt", "Build a REST API"]);
    expect(result.dryRun)
.toBe(false);
  });

  it("works with --prd and --dry-run together", () => {
    const result = parseArgs(["generate", "my-api", "--prd", "prd.md", "--dry-run"]);
    expect(result.dryRun)
.toBe(true);
    expect(result.prdPath)
.toBe("prd.md");
  });

  it("works with --interactive and --dry-run together", () => {
    const result = parseArgs(["generate", "my-api", "--interactive", "--dry-run"]);
    expect(result.dryRun)
.toBe(true);
    expect(result.interactive)
.toBe(true);
  });
});
