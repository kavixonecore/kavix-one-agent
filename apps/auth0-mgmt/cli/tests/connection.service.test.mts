import { describe, it, expect, beforeEach, mock } from "bun:test";
import { resetAuth0Client } from "../src/services/auth0-client.mjs";
import { resetEnvCache } from "../src/config/env.mjs";

function setupEnv(): void {
  process.env["AUTH0_DOMAIN"] = "test.auth0.com";
  process.env["AUTH0_CLIENT_ID"] = "test-client-id";
  process.env["AUTH0_CLIENT_SECRET"] = "test-secret";
}

const mockConnectionsList = mock(() => Promise.resolve({
  data: [
    { id: "con_1", name: "google-oauth2", strategy: "google-oauth2" },
  ],
}));

const mockOrgConnectionsList = mock(() => Promise.resolve({
  data: [
    { connection_id: "con_1", connection: { name: "google-oauth2", strategy: "google-oauth2" } },
  ],
}));

const mockOrgConnectionsAdd = mock(() => Promise.resolve(undefined));
const mockOrgConnectionsDelete = mock(() => Promise.resolve(undefined));

const mockConnectionsCreate = mock(() => Promise.resolve({
  id: "con_new",
  name: "google-social",
  strategy: "google-oauth2",
  enabled_clients: [],
}));

mock.module("auth0", () => ({
  ManagementClient: class {
    organizations = {
      create: mock(), list: mock(), get: mock(), delete: mock(),
      members: {
        list: mock(), create: mock(), delete: mock(),
        roles: { list: mock(), assign: mock(), delete: mock() },
      },
      enabledConnections: {
        list: mockOrgConnectionsList,
        add: mockOrgConnectionsAdd,
        delete: mockOrgConnectionsDelete,
        get: mock(),
        update: mock(),
      },
      invitations: { list: mock(), create: mock(), get: mock(), delete: mock() },
    };
    roles = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
    connections = {
      list: mockConnectionsList,
      create: mockConnectionsCreate,
      get: mock(),
      delete: mock(),
      update: mock(),
    };
  },
}));

describe("connection.service", () => {
  beforeEach(() => {
    resetAuth0Client();
    resetEnvCache();
    setupEnv();
    mockConnectionsList.mockClear();
    mockOrgConnectionsList.mockClear();
    mockOrgConnectionsAdd.mockClear();
    mockOrgConnectionsDelete.mockClear();
    mockConnectionsCreate.mockClear();
  });

  it("listConnections should return mapped connections", async () => {
    const { listConnections } = await import("../src/services/connection.service.mjs");
    const result = await listConnections();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.name).toBe("google-oauth2");
    }
  });

  it("listOrgConnections should return org connections", async () => {
    const { listOrgConnections } = await import("../src/services/connection.service.mjs");
    const result = await listOrgConnections("org_1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.id).toBe("con_1");
    }
  });

  it("enableConnection should call add", async () => {
    const { enableConnection } = await import("../src/services/connection.service.mjs");
    const result = await enableConnection({
      orgId: "org_1",
      connectionId: "con_1",
      assignMembershipOnLogin: true,
    });
    expect(result.ok).toBe(true);
    expect(mockOrgConnectionsAdd).toHaveBeenCalledTimes(1);
  });

  it("disableConnection should call delete", async () => {
    const { disableConnection } = await import("../src/services/connection.service.mjs");
    const result = await disableConnection("org_1", "con_1");
    expect(result.ok).toBe(true);
    expect(mockOrgConnectionsDelete).toHaveBeenCalledWith("org_1", "con_1");
  });

  it("createSocialConnection should create google connection", async () => {
    process.env["GOOGLE_CLIENT_ID"] = "goog-id";
    process.env["GOOGLE_CLIENT_SECRET"] = "goog-secret";
    resetEnvCache();

    const { createSocialConnection } = await import("../src/services/connection.service.mjs");
    const result = await createSocialConnection("google");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("google-social");
    }
  });

  it("createSocialConnection should fail without credentials", async () => {
    delete process.env["GOOGLE_CLIENT_ID"];
    resetEnvCache();

    const { createSocialConnection } = await import("../src/services/connection.service.mjs");
    const result = await createSocialConnection("google");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Missing credentials");
    }
  });
});
