import { describe, it, expect } from "bun:test";

import { jwtAuthTemplate } from "../../templates/addons/jwt-auth/index.mjs";
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

describe("jwt-auth addon", () => {
  describe("template metadata", () => {
    it("has name jwt-auth", () => {
      expect(jwtAuthTemplate.name)
.toBe("jwt-auth");
    });

    it("has type ADDON", () => {
      expect(jwtAuthTemplate.type)
.toBe(TemplateType.ADDON);
    });

    it("has a non-empty description", () => {
      expect(jwtAuthTemplate.description.length)
.toBeGreaterThan(0);
    });
  });

  describe("plan()", () => {
    const planned = jwtAuthTemplate.plan(configurationFixture);

    it("returns 9 files", () => {
      expect(planned)
.toHaveLength(9);
    });

    it("includes i-auth-user interface", () => {
      expect(planned.some((f) => f.path.endsWith("i-auth-user.mts")))
.toBe(true);
    });

    it("includes i-auth-config interface", () => {
      expect(planned.some((f) => f.path.endsWith("i-auth-config.mts")))
.toBe(true);
    });

    it("includes i-audit-log-entry interface", () => {
      expect(planned.some((f) => f.path.endsWith("i-audit-log-entry.mts")))
.toBe(true);
    });

    it("includes interfaces barrel", () => {
      expect(planned.some((f) => f.path === "src/shared/auth/interfaces/index.mts"))
.toBe(true);
    });

    it("includes jwks-verifier", () => {
      expect(planned.some((f) => f.path.endsWith("jwks-verifier.mts")))
.toBe(true);
    });

    it("includes rate-limiter", () => {
      expect(planned.some((f) => f.path.endsWith("rate-limiter.mts")))
.toBe(true);
    });

    it("includes audit-logger", () => {
      expect(planned.some((f) => f.path.endsWith("audit-logger.mts")))
.toBe(true);
    });

    it("includes auth-plugin", () => {
      expect(planned.some((f) => f.path.endsWith("auth-plugin.mts")))
.toBe(true);
    });

    it("includes auth barrel index.mts", () => {
      expect(planned.some((f) => f.path === "src/shared/auth/index.mts"))
.toBe(true);
    });
  });

  describe("render()", () => {
    const rendered = jwtAuthTemplate.render(configurationFixture, context);

    it("returns 9 rendered files", () => {
      expect(rendered)
.toHaveLength(9);
    });

    it("all rendered files have non-empty content", () => {
      for (const file of rendered) {
        expect(file.content.trim().length)
.toBeGreaterThan(0);
      }
    });

    it("i-auth-user has sub, email, roles, permissions, payload fields", () => {
      const file = rendered.find((f) => f.path.endsWith("i-auth-user.mts"));
      expect(file?.content)
.toContain("sub: string");
      expect(file?.content)
.toContain("email: string");
      expect(file?.content)
.toContain("roles: string[]");
      expect(file?.content)
.toContain("permissions: string[]");
      expect(file?.content)
.toContain("payload: Record<string, unknown>");
    });

    it("i-auth-config has jwksUrl, publicPaths, rate limit fields", () => {
      const file = rendered.find((f) => f.path.endsWith("i-auth-config.mts"));
      expect(file?.content)
.toContain("jwksUrl: string");
      expect(file?.content)
.toContain("publicPaths: string[]");
      expect(file?.content)
.toContain("rateLimitIpPerMin: number");
      expect(file?.content)
.toContain("rateLimitUserPerMin: number");
    });

    it("i-audit-log-entry has event, sub, ip, path, method, statusCode", () => {
      const file = rendered.find((f) => f.path.endsWith("i-audit-log-entry.mts"));
      expect(file?.content)
.toContain("event:");
      expect(file?.content)
.toContain("ip: string");
      expect(file?.content)
.toContain("path: string");
      expect(file?.content)
.toContain("method: string");
      expect(file?.content)
.toContain("statusCode: number");
    });

    it("jwks-verifier uses jose createRemoteJWKSet and jwtVerify", () => {
      const file = rendered.find((f) => f.path.endsWith("jwks-verifier.mts"));
      expect(file?.content)
.toContain("createRemoteJWKSet");
      expect(file?.content)
.toContain("jwtVerify");
    });

    it("jwks-verifier accepts jwksOverride for testing", () => {
      const file = rendered.find((f) => f.path.endsWith("jwks-verifier.mts"));
      expect(file?.content)
.toContain("jwksOverride");
    });

    it("rate-limiter uses Map-based sliding window", () => {
      const file = rendered.find((f) => f.path.endsWith("rate-limiter.mts"));
      expect(file?.content)
.toContain("Map<string, number[]>");
      expect(file?.content)
.toContain("checkIp");
      expect(file?.content)
.toContain("checkUser");
    });

    it("audit-logger writes to Winston and MongoDB", () => {
      const file = rendered.find((f) => f.path.endsWith("audit-logger.mts"));
      expect(file?.content)
.toContain("winston");
      expect(file?.content)
.toContain("MongoClient");
      expect(file?.content)
.toContain("auth_audit_log");
    });

    it("auth-plugin exports createAuthPlugin and requireRoles", () => {
      const file = rendered.find((f) => f.path.endsWith("auth-plugin.mts"));
      expect(file?.content)
.toContain("createAuthPlugin");
      expect(file?.content)
.toContain("requireRoles");
      expect(file?.content)
.toContain("isPublicPath");
      expect(file?.content)
.toContain("extractBearerToken");
    });

    it("barrel exports all public APIs", () => {
      const file = rendered.find((f) => f.path === "src/shared/auth/index.mts");
      expect(file?.content)
.toContain("JwksVerifier");
      expect(file?.content)
.toContain("RateLimiter");
      expect(file?.content)
.toContain("AuthAuditLogger");
      expect(file?.content)
.toContain("createAuthPlugin");
    });
  });

  describe("validate()", () => {
    it("returns valid=true for correct rendered files", () => {
      const rendered = jwtAuthTemplate.render(configurationFixture, context);
      const result = jwtAuthTemplate.validate(rendered);
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("returns valid=false for empty files array", () => {
      const result = jwtAuthTemplate.validate([]);
      expect(result.valid)
.toBe(false);
    });

    it("returns valid=false when jwks-verifier is missing", () => {
      const rendered = jwtAuthTemplate.render(configurationFixture, context);
      const without = rendered.filter((f) => !f.path.endsWith("jwks-verifier.mts"));
      const result = jwtAuthTemplate.validate(without);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("jwks-verifier.mts")))
.toBe(true);
    });

    it("returns valid=false when auth-plugin is missing", () => {
      const rendered = jwtAuthTemplate.render(configurationFixture, context);
      const without = rendered.filter((f) => !f.path.endsWith("auth-plugin.mts"));
      const result = jwtAuthTemplate.validate(without);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("auth-plugin.mts")))
.toBe(true);
    });
  });
});
