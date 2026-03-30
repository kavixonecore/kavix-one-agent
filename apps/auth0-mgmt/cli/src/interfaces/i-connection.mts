export type SocialProvider = "google" | "github" | "apple" | "microsoft";

export interface IConnection {
  id: string;
  name: string;
  strategy: string;
  enabledClients: string[];
}

export interface IEnableConnectionInput {
  orgId: string;
  connectionId: string;
  assignMembershipOnLogin: boolean;
}

export const SOCIAL_STRATEGIES: Record<SocialProvider, string> = {
  google: "google-oauth2",
  github: "github",
  apple: "apple",
  microsoft: "windowslive",
} as const;
