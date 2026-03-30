import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getEnv, resetEnvCache } from "../src/config/env.mjs";

describe("env", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  it("should validate required env vars", () => {
    process.env["AUTH0_DOMAIN"] = "test.auth0.com";
    process.env["AUTH0_CLIENT_ID"] = "test-client-id";
    process.env["AUTH0_CLIENT_SECRET"] = "test-secret";

    const env = getEnv();
    expect(env.AUTH0_DOMAIN).toBe("test.auth0.com");
    expect(env.AUTH0_CLIENT_ID).toBe("test-client-id");
    expect(env.AUTH0_CLIENT_SECRET).toBe("test-secret");
  });

  it("should reject missing AUTH0_DOMAIN", () => {
    delete process.env["AUTH0_DOMAIN"];
    process.env["AUTH0_CLIENT_ID"] = "test-client-id";
    process.env["AUTH0_CLIENT_SECRET"] = "test-secret";

    expect(() => getEnv()).toThrow();
  });

  it("should reject missing AUTH0_CLIENT_ID", () => {
    process.env["AUTH0_DOMAIN"] = "test.auth0.com";
    delete process.env["AUTH0_CLIENT_ID"];
    process.env["AUTH0_CLIENT_SECRET"] = "test-secret";

    expect(() => getEnv()).toThrow();
  });

  it("should reject missing AUTH0_CLIENT_SECRET", () => {
    process.env["AUTH0_DOMAIN"] = "test.auth0.com";
    process.env["AUTH0_CLIENT_ID"] = "test-client-id";
    delete process.env["AUTH0_CLIENT_SECRET"];

    expect(() => getEnv()).toThrow();
  });

  it("should accept optional social provider vars", () => {
    process.env["AUTH0_DOMAIN"] = "test.auth0.com";
    process.env["AUTH0_CLIENT_ID"] = "test-client-id";
    process.env["AUTH0_CLIENT_SECRET"] = "test-secret";
    process.env["GOOGLE_CLIENT_ID"] = "google-id";

    const env = getEnv();
    expect(env.GOOGLE_CLIENT_ID).toBe("google-id");
  });

  it("should cache env after first call", () => {
    process.env["AUTH0_DOMAIN"] = "test.auth0.com";
    process.env["AUTH0_CLIENT_ID"] = "test-client-id";
    process.env["AUTH0_CLIENT_SECRET"] = "test-secret";

    const first = getEnv();
    const second = getEnv();
    expect(first).toBe(second);
  });
});
