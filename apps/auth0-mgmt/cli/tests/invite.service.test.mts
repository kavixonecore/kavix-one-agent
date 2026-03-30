import { describe, it, expect, beforeEach, mock } from "bun:test";
import { resetAuth0Client } from "../src/services/auth0-client.mjs";
import { resetEnvCache } from "../src/config/env.mjs";

function setupEnv(): void {
  process.env["AUTH0_DOMAIN"] = "test.auth0.com";
  process.env["AUTH0_CLIENT_ID"] = "test-client-id";
  process.env["AUTH0_CLIENT_SECRET"] = "test-secret";
}

const mockInvCreate = mock(() => Promise.resolve({
  id: "inv_1",
  invitee: { email: "new@user.com" },
  inviter: { name: "Admin" },
  created_at: "2026-01-01T00:00:00Z",
  expires_at: "2026-01-08T00:00:00Z",
  roles: ["role_1"],
}));

const mockInvList = mock(() => Promise.resolve({
  data: [
    {
      id: "inv_1",
      invitee: { email: "new@user.com" },
      inviter: { name: "Admin" },
      created_at: "2026-01-01T00:00:00Z",
      expires_at: "2026-01-08T00:00:00Z",
      roles: [],
    },
  ],
}));

const mockInvDelete = mock(() => Promise.resolve(undefined));

mock.module("auth0", () => ({
  ManagementClient: class {
    organizations = {
      create: mock(), list: mock(), get: mock(), delete: mock(),
      members: {
        list: mock(), create: mock(), delete: mock(),
        roles: { list: mock(), assign: mock(), delete: mock() },
      },
      enabledConnections: { list: mock(), add: mock(), delete: mock(), get: mock(), update: mock() },
      invitations: {
        list: mockInvList,
        create: mockInvCreate,
        get: mock(),
        delete: mockInvDelete,
      },
    };
    roles = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
    connections = { list: mock(), create: mock(), get: mock(), delete: mock(), update: mock() };
  },
}));

describe("invite.service", () => {
  beforeEach(() => {
    resetAuth0Client();
    resetEnvCache();
    setupEnv();
    mockInvCreate.mockClear();
    mockInvList.mockClear();
    mockInvDelete.mockClear();
  });

  it("sendInvite should return mapped invite", async () => {
    const { sendInvite } = await import("../src/services/invite.service.mjs");
    const result = await sendInvite({
      orgId: "org_1",
      clientId: "client_1",
      inviterName: "Admin",
      inviteeEmail: "new@user.com",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("inv_1");
      expect(result.value.inviteeEmail).toBe("new@user.com");
    }
  });

  it("listInvites should return array of invites", async () => {
    const { listInvites } = await import("../src/services/invite.service.mjs");
    const result = await listInvites("org_1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
    }
  });

  it("revokeInvite should call delete", async () => {
    const { revokeInvite } = await import("../src/services/invite.service.mjs");
    const result = await revokeInvite("org_1", "inv_1");
    expect(result.ok).toBe(true);
    expect(mockInvDelete).toHaveBeenCalledWith("org_1", "inv_1");
  });
});
