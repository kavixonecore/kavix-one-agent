import { Elysia } from "elysia";

import type { IAuthConfig } from "./interfaces/i-auth-config.mjs";
import type { IAuthUser } from "./interfaces/i-auth-user.mjs";
import type { IAuditLogEntry } from "./interfaces/i-audit-log-entry.mjs";
import type { JwksVerifier } from "./jwks-verifier.mjs";
import type { RateLimiter } from "./rate-limiter.mjs";
import type { AuthAuditLogger } from "./audit-logger.mjs";

export interface IAuthDeps {
  verifier: JwksVerifier;
  rateLimiter: RateLimiter;
  auditLogger: AuthAuditLogger;
}

interface IAuthState {
  authUser: IAuthUser | undefined;
  authError: { status: number; message: string } | undefined;
  [key: string]: unknown;
}

/**
 * Returns true when the request path matches a public path prefix.
 */
export function isPublicPath(path: string, publicPaths: string[]): boolean {
  return publicPaths.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Extracts the Bearer token from an Authorization header value.
 * Returns undefined when the header is absent or malformed.
 */
export function extractBearerToken(header: string | undefined): string | undefined {
  if (!header?.startsWith("Bearer ")) return undefined;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : undefined;
}

/**
 * Builds a partial request context from an Elysia request.
 */
export function buildRequestContext(request: Request): { ip: string; path: string; method: string } {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const url = new URL(request.url);
  return { ip, path: url.pathname, method: request.method };
}

async function resolveAuthState(
  request: Request,
  config: IAuthConfig,
  deps: IAuthDeps,
): Promise<IAuthState> {
  const requestCtx = buildRequestContext(request);

  if (isPublicPath(requestCtx.path, config.publicPaths)) {
    return { authUser: undefined, authError: undefined };
  }

  if (!deps.rateLimiter.checkIp(requestCtx.ip)) {
    deps.auditLogger.log(buildEntry(requestCtx, 429, "rate_limited", undefined, "IP rate limit exceeded"));
    return { authUser: undefined, authError: { status: 429, message: "Rate limit exceeded" } };
  }

  const token = extractBearerToken(request.headers.get("Authorization") ?? undefined);
  if (!token) {
    deps.auditLogger.log(buildEntry(requestCtx, 401, "failure", undefined, "Missing or malformed Authorization header"));
    return { authUser: undefined, authError: { status: 401, message: "Unauthorized" } };
  }

  try {
    const user = await deps.verifier.verify(token);

    if (!deps.rateLimiter.checkUser(user.sub)) {
      deps.auditLogger.log(buildEntry(requestCtx, 429, "rate_limited", user.sub, "User rate limit exceeded"));
      return { authUser: undefined, authError: { status: 429, message: "Rate limit exceeded" } };
    }

    deps.auditLogger.log(buildEntry(requestCtx, 200, "success", user.sub));
    return { authUser: user, authError: undefined };
  } catch {
    deps.auditLogger.log(buildEntry(requestCtx, 401, "failure", undefined, "JWT verification failed"));
    return { authUser: undefined, authError: { status: 401, message: "Unauthorized" } };
  }
}

/**
 * Creates the Elysia JWT auth plugin.
 * Uses derive() to resolve auth state, then onBeforeHandle() to enforce it.
 * This two-phase approach ensures the error response halts request processing.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAuthPlugin(config: IAuthConfig, deps: IAuthDeps) {
  return new Elysia({ name: "auth-plugin" })
    .derive({ as: "global" }, async ({ request }) => resolveAuthState(request, config, deps))
    .onBeforeHandle({ as: "global" }, ({ authError, set }) => {
      if (authError) {
        set.status = authError.status;
        return { success: false, error: authError.message };
      }
    });
}

function buildEntry(
  ctx: { ip: string; path: string; method: string },
  statusCode: number,
  event: IAuditLogEntry["event"],
  sub?: string,
  reason?: string,
): IAuditLogEntry {
  return {
    timestamp: new Date().toISOString(),
    event,
    sub,
    ip: ctx.ip,
    path: ctx.path,
    method: ctx.method,
    statusCode,
    reason,
  };
}

/**
 * Creates a per-route Elysia plugin that enforces role-based access control.
 * Must be used AFTER createAuthPlugin() has run (so authUser is available).
 * Returns 403 when the user is authenticated but lacks the required role.
 * Returns 401 when there is no authenticated user.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function requireRoles(...roles: string[]) {
  return new Elysia({ name: `require-roles-${roles.join("-")}` })
    .onBeforeHandle(({ authUser, set }: { authUser?: IAuthUser; set: { status?: number | string } }) => {
      if (!authUser) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }

      const hasRole = roles.every((r) => authUser.roles.includes(r));
      if (!hasRole) {
        set.status = 403;
        return { success: false, error: "Forbidden" };
      }
    });
}
