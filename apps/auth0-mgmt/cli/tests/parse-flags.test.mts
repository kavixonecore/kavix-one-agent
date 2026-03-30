import { describe, it, expect } from "bun:test";
import { parseFlags } from "../src/utils/parse-flags.mjs";

describe("parseFlags", () => {
  it("should parse --flag value pairs", () => {
    const result = parseFlags(
      ["--name", "test-org", "--display-name", "Test Org"],
      ["name", "display-name"],
    );
    expect(result).toEqual({
      name: "test-org",
      "display-name": "Test Org",
    });
  });

  it("should ignore unknown flags", () => {
    const result = parseFlags(
      ["--name", "test", "--unknown", "value"],
      ["name"],
    );
    expect(result).toEqual({ name: "test" });
  });

  it("should handle empty args", () => {
    const result = parseFlags([], ["name"]);
    expect(result).toEqual({});
  });

  it("should handle flags without values", () => {
    const result = parseFlags(
      ["--name", "--display-name", "Test"],
      ["name", "display-name"],
    );
    expect(result).toEqual({ "display-name": "Test" });
  });

  it("should handle args that are not flags", () => {
    const result = parseFlags(
      ["something", "--name", "test"],
      ["name"],
    );
    expect(result).toEqual({ name: "test" });
  });
});
