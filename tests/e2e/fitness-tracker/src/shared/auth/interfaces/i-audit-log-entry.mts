/**
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
