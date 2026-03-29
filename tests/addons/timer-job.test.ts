import { describe, it, expect } from "bun:test";

import { timerJobTemplate } from "../../templates/addons/timer-job/index.mjs";
import { TemplateType } from "../../src/core/enums/index.mjs";
import { configurationFixture } from "../fixtures/configuration.fixture.ts";

import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

const context: IGenerationContext = {
  projectName: "my-api",
  projectScope: "my-api",
  outputDir: "/tmp/out",
  features: [configurationFixture],
  dryRun: true,
};

describe("timer-job addon", () => {
  describe("template metadata", () => {
    it("has name timer-job", () => {
      expect(timerJobTemplate.name)
.toBe("timer-job");
    });

    it("has type ADDON", () => {
      expect(timerJobTemplate.type)
.toBe(TemplateType.ADDON);
    });

    it("has a non-empty description", () => {
      expect(timerJobTemplate.description.length)
.toBeGreaterThan(0);
    });
  });

  describe("plan()", () => {
    const planned = timerJobTemplate.plan(configurationFixture);

    it("returns 3 files", () => {
      expect(planned)
.toHaveLength(3);
    });

    it("includes a timer file", () => {
      expect(planned.some((f) => f.path.endsWith("-timer.mts")))
.toBe(true);
    });

    it("includes a config interface file", () => {
      expect(planned.some((f) => f.path.includes("interfaces/i-") && f.path.endsWith("-config.mts")))
.toBe(true);
    });

    it("includes the jobs barrel index.mts", () => {
      expect(planned.some((f) => f.path === "src/jobs/index.mts"))
.toBe(true);
    });
  });

  describe("render()", () => {
    const rendered = timerJobTemplate.render(configurationFixture, context);

    it("returns 3 rendered files", () => {
      expect(rendered)
.toHaveLength(3);
    });

    it("timer file contains the timer class", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("class ConfigurationTimer");
    });

    it("timer file has start() method", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("public start()");
    });

    it("timer file has stop() method for graceful shutdown", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("public stop()");
    });

    it("timer file uses setInterval", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("setInterval");
    });

    it("timer file uses clearInterval on stop", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("clearInterval");
    });

    it("timer file handles SIGTERM and SIGINT", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("SIGTERM");
      expect(file?.content)
.toContain("SIGINT");
    });

    it("timer file supports run-on-startup", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("runOnStartup");
    });

    it("timer file has health check plugin", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("HealthPlugin");
    });

    it("timer file uses Winston logger", () => {
      const file = rendered.find((f) => f.path.endsWith("-timer.mts"));
      expect(file?.content)
.toContain("winston");
    });

    it("config interface has intervalMs and runOnStartup", () => {
      const file = rendered.find((f) => f.path.endsWith("-config.mts"));
      expect(file?.content)
.toContain("intervalMs: number");
      expect(file?.content)
.toContain("runOnStartup: boolean");
    });

    it("barrel exports the timer class", () => {
      const file = rendered.find((f) => f.path === "src/jobs/index.mts");
      expect(file?.content)
.toContain("ConfigurationTimer");
    });

    it("barrel exports the config interface", () => {
      const file = rendered.find((f) => f.path === "src/jobs/index.mts");
      expect(file?.content)
.toContain("IConfigurationConfig");
    });
  });

  describe("validate()", () => {
    it("returns valid=true for correct rendered files", () => {
      const rendered = timerJobTemplate.render(configurationFixture, context);
      const result = timerJobTemplate.validate(rendered);
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("returns valid=false for empty files array", () => {
      const result = timerJobTemplate.validate([]);
      expect(result.valid)
.toBe(false);
    });

    it("returns valid=false when timer file is missing", () => {
      const rendered = timerJobTemplate.render(configurationFixture, context);
      const withoutTimer = rendered.filter((f) => !f.path.endsWith("-timer.mts"));
      const result = timerJobTemplate.validate(withoutTimer);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("timer")))
.toBe(true);
    });

    it("returns valid=false when barrel is missing", () => {
      const rendered = timerJobTemplate.render(configurationFixture, context);
      const withoutBarrel = rendered.filter((f) => f.path !== "src/jobs/index.mts");
      const result = timerJobTemplate.validate(withoutBarrel);
      expect(result.valid)
.toBe(false);
    });
  });
});
