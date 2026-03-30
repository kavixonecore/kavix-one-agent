export interface IInvite {
  id: string;
  inviteeEmail: string;
  inviterName: string;
  createdAt: string;
  expiresAt: string;
  roles: string[];
}

export interface ISendInviteInput {
  orgId: string;
  clientId: string;
  inviterName: string;
  inviteeEmail: string;
  connectionId?: string;
  roleIds?: string[];
  ttlSec?: number;
}
