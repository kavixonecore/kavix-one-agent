import { describe, it, expect, beforeEach, mock } from "bun:test";

// Mock all CLI services before importing the app
const mockCreateOrg = mock(() => Promise.resolve({
  ok: true as const,
  value: { id: "org_123", name: "test-org", displayName: "Test Org" },
}));
const mockListOrgs = mock(() => Promise.resolve({
  ok: true as const,
  value: [{ id: "org_1", name: "org-one", displayName: "Org One" }],
}));
const mockGetOrg = mock(() => Promise.resolve({
  ok: true as const,
  value: { id: "org_1", name: "org-one", displayName: "Org One" },
}));
const mockDeleteOrg = mock(() => Promise.resolve({
  ok: true as const, value: undefined,
}));

mock.module("../../cli/src/services/org.service.mjs", () => ({
  createOrg: mockCreateOrg,
  listOrgs: mockListOrgs,
  getOrg: mockGetOrg,
  deleteOrg: mockDeleteOrg,
}));

const mockListMembers = mock(() => Promise.resolve({
  ok: true as const,
  value: [{ userId: "user_1", email: "a@b.com", name: "Alice" }],
}));
const mockAddMember = mock(() => Promise.resolve({
  ok: true as const, value: undefined,
}));
const mockRemoveMember = mock(() => Promise.resolve({
  ok: true as const, value: undefined,
}));

mock.module("../../cli/src/services/member.service.mjs", () => ({
  listMembers: mockListMembers,
  addMember: mockAddMember,
  removeMember: mockRemoveMember,
}));

const mockCreateRole = mock(() => Promise.resolve({
  ok: true as const,
  value: { id: "role_1", name: "admin", description: "Admin" },
}));
const mockListRoles = mock(() => Promise.resolve({
  ok: true as const,
  value: [{ id: "role_1", name: "admin", description: "Admin" }],
}));
const mockAssignRole = mock(() => Promise.resolve({
  ok: true as const, value: undefined,
}));
const mockGetMemberRoles = mock(() => Promise.resolve({
  ok: true as const,
  value: [{ id: "role_1", name: "admin" }],
}));

mock.module("../../cli/src/services/role.service.mjs", () => ({
  createRole: mockCreateRole,
  listRoles: mockListRoles,
  assignRole: mockAssignRole,
  getMemberRoles: mockGetMemberRoles,
}));

const mockListConnections = mock(() => Promise.resolve({
  ok: true as const, value: [],
}));
const mockListOrgConnections = mock(() => Promise.resolve({
  ok: true as const, value: [],
}));
const mockEnableConnection = mock(() => Promise.resolve({
  ok: true as const, value: undefined,
}));
const mockDisableConnection = mock(() => Promise.resolve({
  ok: true as const, value: undefined,
}));
const mockCreateSocialConnection = mock(() => Promise.resolve({
  ok: true as const,
  value: { id: "con_1", name: "google-social", strategy: "google-oauth2", enabledClients: [] },
}));

mock.module("../../cli/src/services/connection.service.mjs", () => ({
  listConnections: mockListConnections,
  listOrgConnections: mockListOrgConnections,
  enableConnection: mockEnableConnection,
  disableConnection: mockDisableConnection,
  createSocialConnection: mockCreateSocialConnection,
}));

mock.module("../../cli/src/interfaces/i-connection.mjs", () => ({
  SOCIAL_STRATEGIES: {
    google: "google-oauth2",
    github: "github",
    apple: "apple",
    microsoft: "windowslive",
  },
}));

const mockSendInvite = mock(() => Promise.resolve({
  ok: true as const,
  value: {
    id: "inv_1", inviteeEmail: "a@b.com", inviterName: "Admin",
    createdAt: "", expiresAt: "", roles: [],
  },
}));
const mockListInvites = mock(() => Promise.resolve({
  ok: true as const, value: [],
}));
const mockRevokeInvite = mock(() => Promise.resolve({
  ok: true as const, value: undefined,
}));

mock.module("../../cli/src/services/invite.service.mjs", () => ({
  sendInvite: mockSendInvite,
  listInvites: mockListInvites,
  revokeInvite: mockRevokeInvite,
}));

import { createApp } from "../src/app.mjs";

describe("API routes", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  it("GET /health should return ok", async () => {
    const response = await app.handle(new Request("http://localhost/health"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
  });

  it("GET /version should return version", async () => {
    const response = await app.handle(new Request("http://localhost/version"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.version).toBe("0.1.0");
  });

  it("POST /api/v1/orgs should create an org", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test-org", displayName: "Test Org" }),
    }));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("org_123");
  });

  it("GET /api/v1/orgs should list orgs", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/orgs"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("GET /api/v1/orgs/:id should get org", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/orgs/org_1"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("org-one");
  });

  it("DELETE /api/v1/orgs/:id should delete org", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/orgs/org_1", {
      method: "DELETE",
    }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("GET /api/v1/orgs/:id/members should list members", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/orgs/org_1/members"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });

  it("POST /api/v1/orgs/:id/members should add member", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/orgs/org_1/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user_1" }),
    }));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("DELETE /api/v1/orgs/:id/members/:userId should remove member", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/orgs/org_1/members/user_1", {
      method: "DELETE",
    }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("POST /api/v1/roles should create role", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "admin", description: "Admin role" }),
    }));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("admin");
  });

  it("GET /api/v1/roles should list roles", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/roles"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });

  it("POST /api/v1/roles/assign should assign role", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/roles/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: "org_1", userId: "user_1", roleIds: ["role_1"] }),
    }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("GET /api/v1/roles/org/:orgId/member/:userId should get member roles", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/roles/org/org_1/member/user_1"),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });

  it("GET /api/v1/connections should list connections", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/connections"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("GET /api/v1/connections/org/:orgId should list org connections", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/connections/org/org_1"),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("POST /api/v1/connections/org/:orgId/enable should enable connection", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/connections/org/org_1/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: "con_1", assignMembershipOnLogin: true }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("DELETE /api/v1/connections/org/:orgId/:connectionId should disable", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/connections/org/org_1/con_1", {
        method: "DELETE",
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("POST /api/v1/connections/social should create social connection", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/connections/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "google" }),
    }));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("GET /api/v1/audit should return placeholder", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/audit"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("POST /api/v1/invites should send invite", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId: "org_1",
        clientId: "client_1",
        inviterName: "Admin",
        inviteeEmail: "new@user.com",
      }),
    }));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("GET /api/v1/invites/org/:orgId should list invites", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/invites/org/org_1"),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("DELETE /api/v1/invites/:inviteId/org/:orgId should revoke invite", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/invites/inv_1/org/org_1", {
        method: "DELETE",
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
