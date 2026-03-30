export interface IAuditEntry {
  timestamp: string;
  event: string;
  sub?: string;
  ip: string;
  path: string;
  method: string;
  statusCode: number;
  reason?: string;
}
