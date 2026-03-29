import { describe, it, expect } from "bun:test";

import { queueConsumerTemplate } from "../../templates/addons/queue-consumer/index.mjs";
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

describe("queue-consumer addon", () => {
  describe("template metadata", () => {
    it("has name queue-consumer", () => {
      expect(queueConsumerTemplate.name)
.toBe("queue-consumer");
    });

    it("has type ADDON", () => {
      expect(queueConsumerTemplate.type)
.toBe(TemplateType.ADDON);
    });

    it("has a non-empty description", () => {
      expect(queueConsumerTemplate.description.length)
.toBeGreaterThan(0);
    });
  });

  describe("plan()", () => {
    const planned = queueConsumerTemplate.plan(configurationFixture);

    it("returns 2 files", () => {
      expect(planned)
.toHaveLength(2);
    });

    it("includes a consumer file", () => {
      expect(planned.some((f) => f.path.endsWith("-consumer.mts")))
.toBe(true);
    });

    it("includes a message interface file", () => {
      expect(planned.some((f) => f.path.includes("interfaces/i-") && f.path.endsWith("-message.mts")))
.toBe(true);
    });

    it("every planned file has templateName queue-consumer", () => {
      for (const f of planned) {
        expect(f.templateName)
.toBe("queue-consumer");
      }
    });
  });

  describe("render()", () => {
    const rendered = queueConsumerTemplate.render(configurationFixture, context);

    it("returns 2 rendered files", () => {
      expect(rendered)
.toHaveLength(2);
    });

    it("consumer file contains the consumer class", () => {
      const file = rendered.find((f) => f.path.endsWith("-consumer.mts"));
      expect(file?.content)
.toContain("class ConfigurationConsumer");
    });

    it("consumer file imports QueueServiceClient", () => {
      const file = rendered.find((f) => f.path.endsWith("-consumer.mts"));
      expect(file?.content)
.toContain("QueueServiceClient");
    });

    it("consumer file has start() method", () => {
      const file = rendered.find((f) => f.path.endsWith("-consumer.mts"));
      expect(file?.content)
.toContain("public start()");
    });

    it("consumer file has stop() method for graceful shutdown", () => {
      const file = rendered.find((f) => f.path.endsWith("-consumer.mts"));
      expect(file?.content)
.toContain("public stop()");
    });

    it("consumer file handles SIGTERM and SIGINT", () => {
      const file = rendered.find((f) => f.path.endsWith("-consumer.mts"));
      expect(file?.content)
.toContain("SIGTERM");
      expect(file?.content)
.toContain("SIGINT");
    });

    it("consumer file uses Zod for message validation", () => {
      const file = rendered.find((f) => f.path.endsWith("-consumer.mts"));
      expect(file?.content)
.toContain("z.object");
    });

    it("consumer file has health check plugin", () => {
      const file = rendered.find((f) => f.path.endsWith("-consumer.mts"));
      expect(file?.content)
.toContain("HealthPlugin");
    });

    it("message interface file exports the interface", () => {
      const file = rendered.find((f) => f.path.endsWith("-message.mts"));
      expect(file?.content)
.toContain("export interface IConfigurationMessage");
    });

    it("message interface has required fields", () => {
      const file = rendered.find((f) => f.path.endsWith("-message.mts"));
      expect(file?.content)
.toContain("id: string");
      expect(file?.content)
.toContain("type: string");
      expect(file?.content)
.toContain("payload: Record<string, unknown>");
      expect(file?.content)
.toContain("timestamp: string");
    });
  });

  describe("validate()", () => {
    it("returns valid=true for correct rendered files", () => {
      const rendered = queueConsumerTemplate.render(configurationFixture, context);
      const result = queueConsumerTemplate.validate(rendered);
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("returns valid=false for empty files array", () => {
      const result = queueConsumerTemplate.validate([]);
      expect(result.valid)
.toBe(false);
    });

    it("returns valid=false when consumer file is missing", () => {
      const rendered = queueConsumerTemplate.render(configurationFixture, context);
      const withoutConsumer = rendered.filter((f) => !f.path.endsWith("-consumer.mts"));
      const result = queueConsumerTemplate.validate(withoutConsumer);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("consumer")))
.toBe(true);
    });

    it("returns valid=false when interface file is missing", () => {
      const rendered = queueConsumerTemplate.render(configurationFixture, context);
      const withoutInterface = rendered.filter((f) => !f.path.endsWith("-message.mts"));
      const result = queueConsumerTemplate.validate(withoutInterface);
      expect(result.valid)
.toBe(false);
    });
  });
});
