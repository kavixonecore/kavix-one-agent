import { TemplateType } from "../../../src/core/enums/index.mjs";

import type {
  IFeatureSpec,
  IGeneratedFile,
  IGenerationContext,
  IRenderedFile,
  ITemplate,
  IValidationResult,
} from "../../../src/core/interfaces/index.mjs";

/**
 * JWT Auth addon template.
 * Generates provider-agnostic JWT authentication using jose (JWKS-based).
 * Includes: interfaces, JWKS verifier, rate limiter, audit logger, Elysia plugin.
 */
export const jwtAuthTemplate: ITemplate = {

  name: "jwt-auth",
  type: TemplateType.ADDON,
  description: "Generates JWT authentication middleware using jose (JWKS), in-memory rate limiting, dual-write audit logging (Winston + MongoDB), and an Elysia plugin with public path bypass and per-route role checks",

  plan(_feature: IFeatureSpec): IGeneratedFile[] {
    return [
      {
        path: "src/shared/auth/interfaces/i-auth-user.mts",
        description: "Authenticated user extracted from JWT claims",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/interfaces/i-auth-config.mts",
        description: "Auth middleware configuration (JWKS URL, issuer, audience, public paths, rate limits)",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/interfaces/i-audit-log-entry.mts",
        description: "Shape of an audit log entry written on every auth event",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/interfaces/index.mts",
        description: "Barrel export for auth interfaces",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/jwks-verifier.mts",
        description: "JwksVerifier class — verifies JWTs via remote or override JWKS using jose",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/rate-limiter.mts",
        description: "RateLimiter class — in-memory sliding window per IP and per user",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/audit-logger.mts",
        description: "AuthAuditLogger class — dual-write to Winston and MongoDB auth_audit_log collection",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/auth-plugin.mts",
        description: "createAuthPlugin() Elysia plugin + requireRoles() + isPublicPath() + extractBearerToken()",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/index.mts",
        description: "Barrel export for the auth module",
        templateName: "jwt-auth",
        featureName: "jwt-auth",
      },
    ];
  },

  render(_feature: IFeatureSpec, _context: IGenerationContext): IRenderedFile[] {
    return [
      {
        path: "src/shared/auth/interfaces/i-auth-user.mts",
        content: renderAuthUser(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/interfaces/i-auth-config.mts",
        content: renderAuthConfig(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/interfaces/i-audit-log-entry.mts",
        content: renderAuditLogEntry(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/interfaces/index.mts",
        content: renderInterfacesBarrel(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/jwks-verifier.mts",
        content: renderJwksVerifier(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/rate-limiter.mts",
        content: renderRateLimiter(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/audit-logger.mts",
        content: renderAuditLogger(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/auth-plugin.mts",
        content: renderAuthPlugin(),
        featureName: "jwt-auth",
      },
      {
        path: "src/shared/auth/index.mts",
        content: renderBarrel(),
        featureName: "jwt-auth",
      },
    ];
  },

  validate(files: IRenderedFile[]): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (files.length === 0) {
      errors.push("No files were rendered by the jwt-auth addon");
      return { valid: false, errors, warnings };
    }

    const requiredPaths = [
      "src/shared/auth/interfaces/i-auth-user.mts",
      "src/shared/auth/interfaces/i-auth-config.mts",
      "src/shared/auth/interfaces/i-audit-log-entry.mts",
      "src/shared/auth/interfaces/index.mts",
      "src/shared/auth/jwks-verifier.mts",
      "src/shared/auth/rate-limiter.mts",
      "src/shared/auth/audit-logger.mts",
      "src/shared/auth/auth-plugin.mts",
      "src/shared/auth/index.mts",
    ];

    for (const required of requiredPaths) {
      if (!files.some((f) => f.path === required)) {
        errors.push(`Missing required file: ${required}`);
      }
    }

    for (const file of files) {
      if (!file.content || file.content.trim() === "") {
        errors.push(`File has empty content: ${file.path}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

function renderAuthUser(): string {
  return `/**
 * Authenticated user extracted from a verified JWT.
 */
export interface IAuthUser {

  /** JWT subject — typically the user's unique ID */
  sub: string;

  /** User email from claims */
  email: string;

  /** Roles assigned to the user (e.g. ["user", "admin"]) */
  roles: string[];

  /** Fine-grained permissions (e.g. ["read:exercises", "write:workouts"]) */
  permissions: string[];

  /** Raw decoded JWT payload for access to custom claims */
  payload: Record<string, unknown>;
}
`;
}

function renderAuthConfig(): string {
  return `/**
 * Configuration for the JWT auth middleware.
 * Typically constructed from environment variables via buildAuthConfig().
 */
export interface IAuthConfig {

  /** JWKS endpoint URL (e.g. https://tenant.auth0.com/.well-known/jwks.json) */
  jwksUrl: string;

  /** Expected JWT issuer — optional, validates the \`iss\` claim when set */
  issuer?: string;

  /** Expected JWT audience — optional, validates the \`aud\` claim when set */
  audience?: string;

  /** Path prefixes that bypass auth entirely (e.g. ["/health", "/swagger"]) */
  publicPaths: string[];

  /** Max requests per IP per minute (default: 100) */
  rateLimitIpPerMin: number;

  /** Max requests per user per minute (default: 1000) */
  rateLimitUserPerMin: number;
}
`;
}

function renderAuditLogEntry(): string {
  return `/**
 * A single entry written to the auth audit log on every auth event.
 */
export interface IAuditLogEntry {

  /** ISO 8601 timestamp of the event */
  timestamp: string;

  /** "success" | "failure" | "rate_limited" */
  event: "success" | "failure" | "rate_limited";

  /** JWT subject (user ID) — undefined when auth fails before decode */
  sub?: string;

  /** Client IP address */
  ip: string;

  /** Request path (e.g. "/exercises") */
  path: string;

  /** HTTP method */
  method: string;

  /** HTTP status code sent to the client */
  statusCode: number;

  /** Reason for failure or rate limiting — undefined on success */
  reason?: string;
}
`;
}

function renderInterfacesBarrel(): string {
  return `export type { IAuthUser } from "./i-auth-user.mjs";
export type { IAuthConfig } from "./i-auth-config.mjs";
export type { IAuditLogEntry } from "./i-audit-log-entry.mjs";
`;
}

function renderJwksVerifier(): string {
  return `import { createRemoteJWKSet, jwtVerify } from "jose";

import type { IAuthConfig } from "./interfaces/i-auth-config.mjs";
import type { IAuthUser } from "./interfaces/i-auth-user.mjs";

type JWKSFunction = ReturnType<typeof createRemoteJWKSet>;

/**
 * Verifies JWTs using a remote JWKS endpoint (or an injected override for tests).
 * Uses jose's built-in JWKS caching.
 */
export class JwksVerifier {

  readonly #config: IAuthConfig;

  readonly #jwks: JWKSFunction;

  public constructor(config: IAuthConfig, jwksOverride?: JWKSFunction) {
    this.#config = config;
    this.#jwks = jwksOverride ?? createRemoteJWKSet(new URL(config.jwksUrl));
  }

  public async verify(token: string): Promise<IAuthUser> {
    const verifyOptions = this.#buildVerifyOptions();
    const { payload } = await jwtVerify(token, this.#jwks, verifyOptions);
    return this.#mapClaimsToUser(payload as Record<string, unknown>);
  }

  #buildVerifyOptions(): { issuer?: string; audience?: string } {
    const options: { issuer?: string; audience?: string } = {};
    if (this.#config.issuer) {
      options.issuer = this.#config.issuer;
    }
    if (this.#config.audience) {
      options.audience = this.#config.audience;
    }
    return options;
  }

  #mapClaimsToUser(payload: Record<string, unknown>): IAuthUser {
    const sub = typeof payload["sub"] === "string" ? payload["sub"] : "";
    const email = typeof payload["email"] === "string" ? payload["email"] : "";
    const roles = Array.isArray(payload["roles"])
      ? (payload["roles"] as unknown[]).filter((r): r is string => typeof r === "string")
      : [];
    const permissions = Array.isArray(payload["permissions"])
      ? (payload["permissions"] as unknown[]).filter((p): p is string => typeof p === "string")
      : [];

    return { sub, email, roles, permissions, payload };
  }
}
`;
}

function renderRateLimiter(): string {
  return `import type { IAuthConfig } from "./interfaces/i-auth-config.mjs";

/**
 * In-memory sliding window rate limiter.
 * Tracks request timestamps per IP and per user in Maps.
 * A cleanup interval removes stale entries every 60 seconds.
 */
export class RateLimiter {

  readonly #ipWindows: Map<string, number[]> = new Map();

  readonly #userWindows: Map<string, number[]> = new Map();

  readonly #config: IAuthConfig;

  readonly #cleanupInterval: ReturnType<typeof setInterval>;

  readonly #windowMs = 60_000;

  public constructor(config: IAuthConfig) {
    this.#config = config;
    this.#cleanupInterval = setInterval(() => this.#cleanup(), this.#windowMs);
  }

  public checkIp(ip: string): boolean {
    return this.#check(this.#ipWindows, ip, this.#config.rateLimitIpPerMin);
  }

  public checkUser(userId: string): boolean {
    return this.#check(this.#userWindows, userId, this.#config.rateLimitUserPerMin);
  }

  public destroy(): void {
    clearInterval(this.#cleanupInterval);
  }

  #check(windows: Map<string, number[]>, key: string, limit: number): boolean {
    const now = Date.now();
    const cutoff = now - this.#windowMs;
    const timestamps = (windows.get(key) ?? []).filter((t) => t > cutoff);
    timestamps.push(now);
    windows.set(key, timestamps);
    return timestamps.length <= limit;
  }

  #cleanup(): void {
    const cutoff = Date.now() - this.#windowMs;
    for (const [key, timestamps] of this.#ipWindows) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        this.#ipWindows.delete(key);
      } else {
        this.#ipWindows.set(key, filtered);
      }
    }
    for (const [key, timestamps] of this.#userWindows) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        this.#userWindows.delete(key);
      } else {
        this.#userWindows.set(key, filtered);
      }
    }
  }
}
`;
}

function renderAuditLogger(): string {
  return `import winston from "winston";
import type { MongoClient } from "mongodb";

import type { IAuditLogEntry } from "./interfaces/i-audit-log-entry.mjs";

const COLLECTION = "auth_audit_log";

/**
 * Dual-write auth event logger.
 * Writes structured logs via Winston AND inserts into MongoDB auth_audit_log.
 * MongoDB write is fire-and-forget — failures are logged but never thrown.
 */
export class AuthAuditLogger {

  readonly #logger: winston.Logger;

  readonly #db: MongoClient | undefined;

  readonly #dbName: string | undefined;

  public constructor(
    logger: winston.Logger,
    db?: MongoClient,
    dbName?: string,
  ) {
    this.#logger = logger;
    this.#db = db;
    this.#dbName = dbName;
  }

  public log(entry: IAuditLogEntry): void {
    this.#writeToWinston(entry);
    this.#writeToMongo(entry);
  }

  #writeToWinston(entry: IAuditLogEntry): void {
    const level = entry.event === "success" ? "info" : "warn";
    this.#logger[level]("auth_audit", {
      event: entry.event,
      sub: entry.sub,
      ip: entry.ip,
      path: entry.path,
      method: entry.method,
      statusCode: entry.statusCode,
      reason: entry.reason,
    });
  }

  #writeToMongo(entry: IAuditLogEntry): void {
    if (!this.#db || !this.#dbName) return;

    this.#db
      .db(this.#dbName)
      .collection(COLLECTION)
      .insertOne({ ...entry })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.#logger.error("AuthAuditLogger: failed to write to MongoDB", { error: message });
      });
  }
}
`;
}

function renderAuthPlugin(): string {
  return `import { Elysia } from "elysia";

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

/**
 * Returns true when the request path matches a public path prefix.
 */
export function isPublicPath(path: string, publicPaths: string[]): boolean {
  return publicPaths.some((p) => path === p || path.startsWith(\`\${p}/\`));
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
 * Builds a partial audit log entry from an Elysia request context.
 */
export function buildRequestContext(request: Request): { ip: string; path: string; method: string } {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const url = new URL(request.url);
  return { ip, path: url.pathname, method: request.method };
}

/**
 * Creates the Elysia JWT auth plugin.
 * - Skips auth on public paths
 * - Enforces IP rate limit before JWT verification
 * - Verifies JWT via JWKS and attaches user to context as request.authUser
 * - Writes an audit log entry on every auth event
 */
export function createAuthPlugin(config: IAuthConfig, deps: IAuthDeps): Elysia {
  return new Elysia({ name: "auth-plugin" })
    .derive(async ({ request, set }) => {
      const ctx = buildRequestContext(request);

      if (isPublicPath(ctx.path, config.publicPaths)) {
        return { authUser: undefined as IAuthUser | undefined };
      }

      if (!deps.rateLimiter.checkIp(ctx.ip)) {
        return writeAuditAndReturn(deps, ctx, set, 429, "rate_limited", "IP rate limit exceeded");
      }

      const token = extractBearerToken(request.headers.get("Authorization") ?? undefined);
      if (!token) {
        return writeAuditAndReturn(deps, ctx, set, 401, "failure", "Missing or malformed Authorization header");
      }

      try {
        const authUser = await deps.verifier.verify(token);

        if (!deps.rateLimiter.checkUser(authUser.sub)) {
          return writeAuditAndReturn(deps, ctx, set, 429, "rate_limited", "User rate limit exceeded");
        }

        deps.auditLogger.log(buildEntry(ctx, 200, "success", authUser.sub));
        return { authUser: authUser as IAuthUser | undefined };
      } catch {
        return writeAuditAndReturn(deps, ctx, set, 401, "failure", "JWT verification failed");
      }
    });
}

function writeAuditAndReturn(
  deps: IAuthDeps,
  ctx: { ip: string; path: string; method: string },
  set: { status?: number | string },
  statusCode: number,
  event: IAuditLogEntry["event"],
  reason: string,
): { authUser: undefined } {
  deps.auditLogger.log(buildEntry(ctx, statusCode, event, undefined, reason));
  set.status = statusCode;
  return { authUser: undefined };
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
export function requireRoles(...roles: string[]): Elysia {
  return new Elysia({ name: \`require-roles-\${roles.join("-")}\` })
    .derive(({ authUser, set }: { authUser?: IAuthUser; set: { status?: number | string } }) => {
      if (!authUser) {
        set.status = 401;
        return { authUser: undefined as IAuthUser | undefined };
      }

      const hasRole = roles.every((r) => authUser.roles.includes(r));
      if (!hasRole) {
        set.status = 403;
        return { authUser: undefined as IAuthUser | undefined };
      }

      return { authUser };
    });
}
`;
}

function renderBarrel(): string {
  return `export { JwksVerifier } from "./jwks-verifier.mjs";
export { RateLimiter } from "./rate-limiter.mjs";
export { AuthAuditLogger } from "./audit-logger.mjs";
export { createAuthPlugin, requireRoles, isPublicPath, extractBearerToken, buildRequestContext } from "./auth-plugin.mjs";
export type { IAuthDeps } from "./auth-plugin.mjs";
export type { IAuthUser } from "./interfaces/i-auth-user.mjs";
export type { IAuthConfig } from "./interfaces/i-auth-config.mjs";
export type { IAuditLogEntry } from "./interfaces/i-audit-log-entry.mjs";
`;
}
