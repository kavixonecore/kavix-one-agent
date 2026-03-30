export interface IInvite {
  id: string;
  inviteeEmail: string;
  inviterName: string;
  createdAt: string;
  expiresAt: string;
  roles: string[];
}
