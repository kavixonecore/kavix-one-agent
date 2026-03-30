import { describe, it, expect, beforeEach, mock } from "bun:test";
import { resetAuth0Client } from "../src/services/auth0-client.mjs";
import { resetEnvCache } from "../src/config/env.mjs";

function setupEnv(): void {
  process.env["AUTH0_DOMAIN"] = "test.auth0.com";
  process.env["AUTH0_CLIENT_ID"] = "test-client-id";
  process.env["AUTH0_CLIENT_SECRET"] = "test-secret";
}

const mockMembersList = mock(() => Promise.resolve({
  data: [
    { user_id: "user_1", email: "a@b.com", name: "Alice" },
    { user_id: "user_2", email: "c@d.com", name: "Bob" },
  ],
}));

const mockMembersCreate = mock(() => Promise.resolve(undefined));
const mockMembersDelete = mock(() => Promise.resolve(undefined));

mock.module("auth0", () => ({
  ManagementClient: class {
    organizations = {
      create: mock(), list: mock(), get: mock(), delete: mock(),
      members: {
        list: mockMembersList,
        create: mockMembersCreate,
        delete: mockMembersDelete,
        roles: { list: mock(), assign: mock(), delete: mock() },
      },
      enabledConnections: { list: mock(), add: mock(), delete: mock(), get: mock(), update: mock() },
      invitations: { list: mock(), create: mock(), get: mock(), delete: mock() },
    };
    roles = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
    connections = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
  },
}));

describe("member.service", () => {
  beforeEach(() => {
    resetAuth0Client();
    resetEnvCache();
    setupEnv();
    mockMembersList.mockClear();
    mockMembersCreate.mockClear();
    mockMembersDelete.mockClear();
  });

  it("listMembers should return mapped members", async () => {
    const { listMembers } = await import("../src/services/member.service.mjs");
    const result = await listMembers("org_123");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
      expect(result.value[0]?.userId).toBe("user_1");
      expect(result.value[0]?.email).toBe("a@b.com");
    }
  });

  it("addMember should call create with correct args", async () => {
    const { addMember } = await import("../src/services/member.service.mjs");
    const result = await addMember("org_123", "user_456");
    expect(result.ok).toBe(true);
    expect(mockMembersCreate).toHaveBeenCalledWith("org_123", {
      members: ["user_456"],
    });
  });

  it("removeMember should call delete with correct args", async () => {
    const { removeMember } = await import("../src/services/member.service.mjs");
    const result = await removeMember("org_123", "user_456");
    expect(result.ok).toBe(true);
    expect(mockMembersDelete).toHaveBeenCalledWith("org_123", {
      members: ["user_456"],
    });
  });
});
