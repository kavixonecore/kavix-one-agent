import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWSHeaderParameters, FlattenedJWSInput } from "jose";

import type { IAuthConfig } from "./interfaces/i-auth-config.mjs";
import type { IAuthUser } from "./interfaces/i-auth-user.mjs";

/** Common callable interface accepted by jose's jwtVerify for JWKS resolution */
export type JWKSFunction = (
  protectedHeader?: JWSHeaderParameters,
  token?: FlattenedJWSInput,
) => Promise<CryptoKey>;

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
