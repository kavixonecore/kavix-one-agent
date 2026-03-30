export interface IMember {
  userId: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface IAddMemberInput {
  orgId: string;
  userId: string;
}
