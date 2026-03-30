import { describe, it, expect, beforeEach, mock } from "bun:test";
import { resetAuth0Client } from "../src/services/auth0-client.mjs";
import { resetEnvCache } from "../src/config/env.mjs";

function setupEnv(): void {
  process.env["AUTH0_DOMAIN"] = "test.auth0.com";
  process.env["AUTH0_CLIENT_ID"] = "test-client-id";
  process.env["AUTH0_CLIENT_SECRET"] = "test-secret";
}

const mockCreate = mock(() => Promise.resolve({
  id: "org_123",
  name: "test-org",
  display_name: "Test Org",
  metadata: {},
}));

const mockList = mock(() => Promise.resolve({
  data: [
    { id: "org_1", name: "org-one", display_name: "Org One" },
    { id: "org_2", name: "org-two", display_name: "Org Two" },
  ],
}));

const mockGet = mock(() => Promise.resolve({
  id: "org_123",
  name: "test-org",
  display_name: "Test Org",
}));

const mockDelete = mock(() => Promise.resolve(undefined));

mock.module("auth0", () => ({
  ManagementClient: class {
    organizations = {
      create: mockCreate,
      list: mockList,
      get: mockGet,
      delete: mockDelete,
      members: { list: mock(), create: mock(), delete: mock(), roles: { list: mock(), assign: mock(), delete: mock() } },
      enabledConnections: { list: mock(), add: mock(), delete: mock(), get: mock(), update: mock() },
      invitations: { list: mock(), create: mock(), get: mock(), delete: mock() },
    };
    roles = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
    connections = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
  },
}));

describe("org.service", () => {
  beforeEach(() => {
    resetAuth0Client();
    resetEnvCache();
    setupEnv();
    mockCreate.mockClear();
    mockList.mockClear();
    mockGet.mockClear();
    mockDelete.mockClear();
  });

  it("createOrg should return success with mapped org", async () => {
    const { createOrg } = await import("../src/services/org.service.mjs");
    const result = await createOrg({ name: "test-org", displayName: "Test Org" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("org_123");
      expect(result.value.name).toBe("test-org");
      expect(result.value.displayName).toBe("Test Org");
    }
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("listOrgs should return array of orgs", async () => {
    const { listOrgs } = await import("../src/services/org.service.mjs");
    const result = await listOrgs();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
      expect(result.value[0]?.name).toBe("org-one");
    }
  });

  it("getOrg should return a single org", async () => {
    const { getOrg } = await import("../src/services/org.service.mjs");
    const result = await getOrg("org_123");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("org_123");
    }
    expect(mockGet).toHaveBeenCalledWith("org_123");
  });

  it("deleteOrg should return success", async () => {
    const { deleteOrg } = await import("../src/services/org.service.mjs");
    const result = await deleteOrg("org_123");
    expect(result.ok).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith("org_123");
  });

  it("createOrg should return error on failure", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API error"));
    const { createOrg } = await import("../src/services/org.service.mjs");
    const result = await createOrg({ name: "fail", displayName: "Fail" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("API error");
    }
  });
});
