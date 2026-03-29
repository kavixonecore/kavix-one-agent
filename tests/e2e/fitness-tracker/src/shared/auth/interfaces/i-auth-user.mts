/**
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
