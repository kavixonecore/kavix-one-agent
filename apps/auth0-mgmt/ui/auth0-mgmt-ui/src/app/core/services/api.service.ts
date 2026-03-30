import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import type { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import type {
  ApiResponse,
  IOrg,
  IMember,
  IRole,
  IConnection,
  IOrgConnection,
  IInvite,
  IAuditEntry,
} from "../../interfaces";

@Injectable({ providedIn: "root" })
export class ApiService {

  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  // --- Organizations ---

  getOrgs(page = 1, limit = 50): Observable<ApiResponse<IOrg[]>> {
    const params = new HttpParams()
      .set("page", page)
      .set("limit", limit);
    return this.http.get<ApiResponse<IOrg[]>>(`${this.base}/orgs`, { params });
  }

  getOrg(id: string): Observable<ApiResponse<IOrg>> {
    return this.http.get<ApiResponse<IOrg>>(`${this.base}/orgs/${id}`);
  }

  createOrg(body: { name: string; displayName: string; metadata?: Record<string, string> }): Observable<ApiResponse<IOrg>> {
    return this.http.post<ApiResponse<IOrg>>(`${this.base}/orgs`, body);
  }

  deleteOrg(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.base}/orgs/${id}`);
  }

  // --- Members ---

  getMembers(orgId: string): Observable<ApiResponse<IMember[]>> {
    return this.http.get<ApiResponse<IMember[]>>(`${this.base}/orgs/${orgId}/members`);
  }

  addMember(orgId: string, userId: string): Observable<ApiResponse<{ added: boolean }>> {
    return this.http.post<ApiResponse<{ added: boolean }>>(
      `${this.base}/orgs/${orgId}/members`,
      { userId },
    );
  }

  removeMember(orgId: string, userId: string): Observable<ApiResponse<{ removed: boolean }>> {
    return this.http.delete<ApiResponse<{ removed: boolean }>>(
      `${this.base}/orgs/${orgId}/members/${userId}`,
    );
  }

  // --- Roles ---

  getRoles(): Observable<ApiResponse<IRole[]>> {
    return this.http.get<ApiResponse<IRole[]>>(`${this.base}/roles`);
  }

  createRole(body: { name: string; description?: string }): Observable<ApiResponse<IRole>> {
    return this.http.post<ApiResponse<IRole>>(`${this.base}/roles`, body);
  }

  assignRoles(body: { orgId: string; userId: string; roleIds: string[] }): Observable<ApiResponse<{ assigned: boolean }>> {
    return this.http.post<ApiResponse<{ assigned: boolean }>>(
      `${this.base}/roles/assign`,
      body,
    );
  }

  getMemberRoles(orgId: string, userId: string): Observable<ApiResponse<IRole[]>> {
    return this.http.get<ApiResponse<IRole[]>>(
      `${this.base}/roles/org/${orgId}/member/${userId}`,
    );
  }

  // --- Connections ---

  getConnections(): Observable<ApiResponse<IConnection[]>> {
    return this.http.get<ApiResponse<IConnection[]>>(`${this.base}/connections`);
  }

  getOrgConnections(orgId: string): Observable<ApiResponse<IOrgConnection[]>> {
    return this.http.get<ApiResponse<IOrgConnection[]>>(
      `${this.base}/connections/org/${orgId}`,
    );
  }

  enableConnection(orgId: string, body: { connectionId: string; assignMembershipOnLogin: boolean }): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.base}/connections/org/${orgId}/enable`,
      body,
    );
  }

  disableConnection(orgId: string, connectionId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.base}/connections/org/${orgId}/${connectionId}`,
    );
  }

  // --- Invitations ---

  getInvitations(orgId: string): Observable<ApiResponse<IInvite[]>> {
    return this.http.get<ApiResponse<IInvite[]>>(`${this.base}/invites/org/${orgId}`);
  }

  createInvitation(body: {
    orgId: string;
    clientId: string;
    inviterName: string;
    inviteeEmail: string;
    connectionId?: string;
    roleIds?: string[];
    ttlSec?: number;
  }): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/invites`, body);
  }

  deleteInvitation(inviteId: string, orgId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.base}/invites/${inviteId}/org/${orgId}`,
    );
  }

  // --- Audit ---

  getAuditLogs(params: {
    orgId?: string;
    userId?: string;
    event?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<IAuditEntry[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ApiResponse<IAuditEntry[]>>(
      `${this.base}/audit`,
      { params: httpParams },
    );
  }

  // --- Health ---

  getHealth(): Observable<{ status: string; timestamp: string; uptime: number }> {
    return this.http.get<{ status: string; timestamp: string; uptime: number }>("/health");
  }
}
