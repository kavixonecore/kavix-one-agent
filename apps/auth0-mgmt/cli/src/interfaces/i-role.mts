export interface IRole {
  id: string;
  name: string;
  description?: string;
}

export interface ICreateRoleInput {
  name: string;
  description?: string;
}

export interface IAssignRoleInput {
  orgId: string;
  userId: string;
  roleIds: string[];
}
