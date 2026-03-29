import { describe, it, expect } from "bun:test";

import { teamsNotificationTemplate } from "../../templates/addons/teams-notification/index.mjs";
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

describe("teams-notification addon", () => {
  describe("template metadata", () => {
    it("has name teams-notification", () => {
      expect(teamsNotificationTemplate.name)
.toBe("teams-notification");
    });

    it("has type ADDON", () => {
      expect(teamsNotificationTemplate.type)
.toBe(TemplateType.ADDON);
    });

    it("has a non-empty description", () => {
      expect(teamsNotificationTemplate.description.length)
.toBeGreaterThan(0);
    });
  });

  describe("plan()", () => {
    const planned = teamsNotificationTemplate.plan(configurationFixture);

    it("returns 3 files", () => {
      expect(planned)
.toHaveLength(3);
    });

    it("includes teams-notification-service.mts", () => {
      expect(planned.some((f) => f.path === "src/lib/teams/teams-notification-service.mts"))
.toBe(true);
    });

    it("includes i-adaptive-card.mts", () => {
      expect(planned.some((f) => f.path === "src/lib/teams/interfaces/i-adaptive-card.mts"))
.toBe(true);
    });

    it("includes barrel index.mts", () => {
      expect(planned.some((f) => f.path === "src/lib/teams/index.mts"))
.toBe(true);
    });
  });

  describe("render()", () => {
    const rendered = teamsNotificationTemplate.render(configurationFixture, context);

    it("returns 3 rendered files", () => {
      expect(rendered)
.toHaveLength(3);
    });

    it("service file contains TeamsNotificationService class", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("class TeamsNotificationService");
    });

    it("service has notifySuccess method", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("public async notifySuccess");
    });

    it("service has notifyError method", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("public async notifyError");
    });

    it("service has notifyInfo method", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("public async notifyInfo");
    });

    it("service has sendCard method for custom cards", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("public async sendCard");
    });

    it("service uses Axios to POST to webhook", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("axios.post");
      expect(file?.content)
.toContain("#webhookUrl");
    });

    it("service uses Winston logger", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("winston");
    });

    it("service builds Adaptive Card with AccentColor", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/teams-notification-service.mts");
      expect(file?.content)
.toContain("AdaptiveCard");
      expect(file?.content)
.toContain("accentColor");
    });

    it("i-adaptive-card.mts exports IAdaptiveCard interface", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/interfaces/i-adaptive-card.mts");
      expect(file?.content)
.toContain("export interface IAdaptiveCard");
    });

    it("i-adaptive-card.mts exports IAdaptiveCardBody interface", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/interfaces/i-adaptive-card.mts");
      expect(file?.content)
.toContain("export interface IAdaptiveCardBody");
    });

    it("barrel exports TeamsNotificationService", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/index.mts");
      expect(file?.content)
.toContain("TeamsNotificationService");
    });

    it("barrel exports IAdaptiveCard type", () => {
      const file = rendered.find((f) => f.path === "src/lib/teams/index.mts");
      expect(file?.content)
.toContain("IAdaptiveCard");
    });
  });

  describe("validate()", () => {
    it("returns valid=true for correct rendered files", () => {
      const rendered = teamsNotificationTemplate.render(configurationFixture, context);
      const result = teamsNotificationTemplate.validate(rendered);
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("returns valid=false when service file is missing", () => {
      const rendered = teamsNotificationTemplate.render(configurationFixture, context);
      const withoutService = rendered.filter(
        (f) => f.path !== "src/lib/teams/teams-notification-service.mts"
      );
      const result = teamsNotificationTemplate.validate(withoutService);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("teams-notification-service")))
.toBe(true);
    });

    it("returns valid=false when i-adaptive-card.mts is missing", () => {
      const rendered = teamsNotificationTemplate.render(configurationFixture, context);
      const withoutCard = rendered.filter(
        (f) => f.path !== "src/lib/teams/interfaces/i-adaptive-card.mts"
      );
      const result = teamsNotificationTemplate.validate(withoutCard);
      expect(result.valid)
.toBe(false);
    });

    it("returns valid=false when a file has empty content", () => {
      const rendered = teamsNotificationTemplate.render(configurationFixture, context);
      const withEmpty = rendered.map((f) =>
        f.path === "src/lib/teams/index.mts" ? { ...f, content: "" } : f
      );
      const result = teamsNotificationTemplate.validate(withEmpty);
      expect(result.valid)
.toBe(false);
    });
  });
});
