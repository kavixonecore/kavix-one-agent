import { Elysia, t } from "elysia";
import { createOrg, listOrgs, getOrg, deleteOrg } from "../../../cli/src/services/org.service.mjs";
import { listMembers, addMember, removeMember } from "../../../cli/src/services/member.service.mjs";

function errorResponse(error: Error): { success: false; error: string } {
  return { success: false, error: error.message };
}

export function orgsRouter(): Elysia {
  return new Elysia({ prefix: "/orgs" })
    .post("/", async ({ body, set }) => {
      const result = await createOrg({
        name: body.name,
        displayName: body.displayName,
        metadata: body.metadata,
      });
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      set.status = 201;
      return { success: true as const, data: result.value };
    }, {
      body: t.Object({
        name: t.String(),
        displayName: t.String(),
        metadata: t.Optional(t.Record(t.String(), t.String())),
      }),
    })
    .get("/", async ({ set }) => {
      const result = await listOrgs();
      if (!result.ok) {
        set.status = 500;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value, count: result.value.length };
    })
    .get("/:id", async ({ params, set }) => {
      const result = await getOrg(params.id);
      if (!result.ok) {
        set.status = 404;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value };
    }, {
      params: t.Object({ id: t.String() }),
    })
    .delete("/:id", async ({ params, set }) => {
      const result = await deleteOrg(params.id);
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      return { success: true as const, data: null };
    }, {
      params: t.Object({ id: t.String() }),
    })
    .get("/:id/members", async ({ params, set }) => {
      const result = await listMembers(params.id);
      if (!result.ok) {
        set.status = 500;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value, count: result.value.length };
    }, {
      params: t.Object({ id: t.String() }),
    })
    .post("/:id/members", async ({ params, body, set }) => {
      const result = await addMember(params.id, body.userId);
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      set.status = 201;
      return { success: true as const, data: null };
    }, {
      params: t.Object({ id: t.String() }),
      body: t.Object({ userId: t.String() }),
    })
    .delete("/:id/members/:userId", async ({ params, set }) => {
      const result = await removeMember(params.id, params.userId);
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      return { success: true as const, data: null };
    }, {
      params: t.Object({ id: t.String(), userId: t.String() }),
    });
}
