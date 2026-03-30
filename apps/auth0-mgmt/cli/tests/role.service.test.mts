import { describe, it, expect, beforeEach, mock } from "bun:test";
import { resetAuth0Client } from "../src/services/auth0-client.mjs";
import { resetEnvCache } from "../src/config/env.mjs";

function setupEnv(): void {
  process.env["AUTH0_DOMAIN"] = "test.auth0.com";
  process.env["AUTH0_CLIENT_ID"] = "test-client-id";
  process.env["AUTH0_CLIENT_SECRET"] = "test-secret";
}

const mockRolesCreate = mock(() => Promise.resolve({
  id: "role_1",
  name: "admin",
  description: "Administrator",
}));

const mockRolesList = mock(() => Promise.resolve({
  data: [
    { id: "role_1", name: "admin", description: "Administrator" },
    { id: "role_2", name: "viewer", description: "Read only" },
  ],
}));

const mockMemberRolesList = mock(() => Promise.resolve({
  data: [{ id: "role_1", name: "admin", description: "Administrator" }],
}));

const mockMemberRolesAssign = mock(() => Promise.resolve(undefined));

mock.module("auth0", () => ({
  ManagementClient: class {
    organizations = {
      create: mock(), list: mock(), get: mock(), delete: mock(),
      members: {
        list: mock(), create: mock(), delete: mock(),
        roles: {
          list: mockMemberRolesList,
          assign: mockMemberRolesAssign,
          delete: mock(),
        },
      },
      enabledConnections: { list: mock(), add: mock(), delete: mock(), get: mock(), update: mock() },
      invitations: { list: mock(), create: mock(), get: mock(), delete: mock() },
    };
    roles = {
      list: mockRolesList,
      create: mockRolesCreate,
      get: mock(),
      delete: mock(),
      update: mock(),
    };
    connections = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
  },
}));

describe("role.service", () => {
  beforeEach(() => {
    resetAuth0Client();
    resetEnvCache();
    setupEnv();
    mockRolesCreate.mockClear();
    mockRolesList.mockClear();
    mockMemberRolesList.mockClear();
    mockMemberRolesAssign.mockClear();
  });

  it("createRole should return mapped role", async () => {
    const { createRole } = await import("../src/services/role.service.mjs");
    const result = await createRole("admin", "Administrator");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("role_1");
      expect(result.value.name).toBe("admin");
    }
  });

  it("listRoles should return array of roles", async () => {
    const { listRoles } = await import("../src/services/role.service.mjs");
    const result = await listRoles();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
    }
  });

  it("assignRole should call assign with correct args", async () => {
    const { assignRole } = await import("../src/services/role.service.mjs");
    const result = await assignRole("org_1", "user_1", ["role_1", "role_2"]);
    expect(result.ok).toBe(true);
    expect(mockMemberRolesAssign).toHaveBeenCalledWith(
      "org_1", "user_1", { roles: ["role_1", "role_2"] },
    );
  });

  it("getMemberRoles should return roles for member", async () => {
    const { getMemberRoles } = await import("../src/services/role.service.mjs");
    const result = await getMemberRoles("org_1", "user_1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.name).toBe("admin");
    }
  });
});
