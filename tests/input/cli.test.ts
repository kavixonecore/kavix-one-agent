import { describe, it, expect } from "bun:test";

import { parseArgs } from "../../src/input/cli.mjs";

describe("cli", () => {
  describe("parseArgs", () => {
    describe("error cases", () => {
      it("throws when no arguments provided", () => {
        expect(() => parseArgs([]))
.toThrow("No command provided");
      });

      it("throws on unknown command", () => {
        expect(() => parseArgs(["unknown"]))
.toThrow('Unknown command: "unknown"');
      });

      it("throws when generate is called without a project name", () => {
        expect(() => parseArgs(["generate"]))
.toThrow("generate requires a project name");
      });

      it("throws when --prompt flag has no value", () => {
        expect(() => parseArgs(["generate", "my-api", "--prompt"]))
.toThrow("--prompt requires a value");
      });

      it("throws when --prd flag has no value", () => {
        expect(() => parseArgs(["generate", "my-api", "--prd"]))
.toThrow("--prd requires a file path");
      });

      it("throws on unknown flag for generate", () => {
        expect(() => parseArgs(["generate", "my-api", "--unknown"]))
.toThrow('Unknown flag: "--unknown"');
      });
    });

    describe("simple commands", () => {
      it("parses resume command", () => {
        const result = parseArgs(["resume"]);
        expect(result.command)
.toBe("resume");
        expect(result.projectName)
.toBeUndefined();
      });

      it("parses status command", () => {
        const result = parseArgs(["status"]);
        expect(result.command)
.toBe("status");
      });

      it("parses trace command", () => {
        const result = parseArgs(["trace"]);
        expect(result.command)
.toBe("trace");
      });
    });

    describe("generate command", () => {
      it("parses generate with project name only", () => {
        const result = parseArgs(["generate", "my-api"]);
        expect(result.command)
.toBe("generate");
        expect(result.projectName)
.toBe("my-api");
        expect(result.prompt)
.toBeUndefined();
        expect(result.prdPath)
.toBeUndefined();
        expect(result.interactive)
.toBe(false);
      });

      it("parses generate with --prompt flag", () => {
        const result = parseArgs(["generate", "my-api", "--prompt", "Build a work order API"]);
        expect(result.command)
.toBe("generate");
        expect(result.projectName)
.toBe("my-api");
        expect(result.prompt)
.toBe("Build a work order API");
      });

      it("parses generate with --prd flag", () => {
        const result = parseArgs(["generate", "my-api", "--prd", "/path/to/prd.md"]);
        expect(result.command)
.toBe("generate");
        expect(result.projectName)
.toBe("my-api");
        expect(result.prdPath)
.toBe("/path/to/prd.md");
      });

      it("parses generate with --interactive flag", () => {
        const result = parseArgs(["generate", "my-api", "--interactive"]);
        expect(result.command)
.toBe("generate");
        expect(result.interactive)
.toBe(true);
      });

      it("parses generate with all flags combined", () => {
        const result = parseArgs([
          "generate",
          "my-api",
          "--prompt",
          "Some description",
          "--prd",
          "/docs/prd.md",
          "--interactive",
        ]);
        expect(result.command)
.toBe("generate");
        expect(result.projectName)
.toBe("my-api");
        expect(result.prompt)
.toBe("Some description");
        expect(result.prdPath)
.toBe("/docs/prd.md");
        expect(result.interactive)
.toBe(true);
      });

      it("does not set prompt property when not provided", () => {
        const result = parseArgs(["generate", "my-api"]);
        expect("prompt" in result)
.toBe(false);
      });

      it("does not set prdPath property when not provided", () => {
        const result = parseArgs(["generate", "my-api"]);
        expect("prdPath" in result)
.toBe(false);
      });
    });
  });
});
