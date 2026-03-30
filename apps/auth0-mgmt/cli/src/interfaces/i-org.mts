export interface IOrg {
  id: string;
  name: string;
  displayName: string;
  metadata?: Record<string, string>;
}

export interface ICreateOrgInput {
  name: string;
  displayName: string;
  metadata?: Record<string, string>;
}
