export interface IConnection {
  id: string;
  name: string;
  strategy: string;
  enabledClients: string[];
}

export interface IOrgConnection {
  connectionId: string;
  assignMembershipOnLogin: boolean;
  connection: { name: string; strategy: string };
}
