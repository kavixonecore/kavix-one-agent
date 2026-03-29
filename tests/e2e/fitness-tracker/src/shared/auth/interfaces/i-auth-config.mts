/**
 * Configuration for the JWT auth middleware.
 * Typically constructed from environment variables via buildAuthConfig().
 */
export interface IAuthConfig {

  /** JWKS endpoint URL (e.g. https://tenant.auth0.com/.well-known/jwks.json) */
  jwksUrl: string;

  /** Expected JWT issuer — optional, validates the `iss` claim when set */
  issuer?: string;

  /** Expected JWT audience — optional, validates the `aud` claim when set */
  audience?: string;

  /** Path prefixes that bypass auth entirely (e.g. ["/health", "/swagger"]) */
  publicPaths: string[];

  /** Max requests per IP per minute (default: 100) */
  rateLimitIpPerMin: number;

  /** Max requests per user per minute (default: 1000) */
  rateLimitUserPerMin: number;
}
