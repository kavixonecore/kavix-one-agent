import { getAuth0Client } from "./auth0-client.mjs";
import type { Result } from "../interfaces/i-result.mjs";
import type {
  IConnection,
  IEnableConnectionInput,
  SocialProvider,
} from "../interfaces/i-connection.mjs";
import { SOCIAL_STRATEGIES } from "../interfaces/i-connection.mjs";
import { getEnv } from "../config/env.mjs";

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export async function listConnections(): Promise<Result<IConnection[]>> {
  try {
    const client = getAuth0Client();
    const page = await client.connections.list();
    const connections: IConnection[] = page.data.map((c) => ({
      id: c.id ?? "",
      name: c.name ?? "",
      strategy: c.strategy ?? "",
      enabledClients: [],
    }));
    return { ok: true, value: connections };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function enableConnection(
  input: IEnableConnectionInput,
): Promise<Result<void>> {
  try {
    const client = getAuth0Client();
    await client.organizations.enabledConnections.add(input.orgId, {
      connection_id: input.connectionId,
      assign_membership_on_login: input.assignMembershipOnLogin,
    });
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function disableConnection(
  orgId: string,
  connectionId: string,
): Promise<Result<void>> {
  try {
    const client = getAuth0Client();
    await client.organizations.enabledConnections.delete(
      orgId,
      connectionId,
    );
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function listOrgConnections(
  orgId: string,
): Promise<Result<IConnection[]>> {
  try {
    const client = getAuth0Client();
    const page = await client.organizations.enabledConnections.list(orgId);
    const connections: IConnection[] = page.data.map((c) => ({
      id: c.connection_id ?? "",
      name: c.connection?.name ?? "",
      strategy: c.connection?.strategy ?? "",
      enabledClients: [],
    }));
    return { ok: true, value: connections };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

interface ISocialConnectionConfig {
  clientId: string;
  clientSecret: string;
  teamId?: string;
  keyId?: string;
}

function getSocialConfig(
  provider: SocialProvider,
): ISocialConnectionConfig | null {
  const env = getEnv();
  const configMap: Record<SocialProvider, ISocialConnectionConfig | null> = {
    google: env.GOOGLE_CLIENT_ID ? {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
    } : null,
    github: env.GITHUB_CLIENT_ID ? {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET ?? "",
    } : null,
    apple: env.APPLE_CLIENT_ID ? {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET ?? "",
      teamId: env.APPLE_TEAM_ID,
      keyId: env.APPLE_KEY_ID,
    } : null,
    microsoft: env.MICROSOFT_CLIENT_ID ? {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET ?? "",
    } : null,
  };
  return configMap[provider];
}

export async function createSocialConnection(
  provider: SocialProvider,
): Promise<Result<IConnection>> {
  try {
    const config = getSocialConfig(provider);
    if (!config) {
      return {
        ok: false,
        error: new Error(`Missing credentials for ${provider}`),
      };
    }
    const client = getAuth0Client();
    const strategy = SOCIAL_STRATEGIES[provider];
    const response = await client.connections.create({
      name: `${provider}-social`,
      strategy,
      options: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        ...(config.teamId && { team_id: config.teamId }),
        ...(config.keyId && { key_id: config.keyId }),
      },
    });
    return {
      ok: true,
      value: {
        id: response.id ?? "",
        name: response.name ?? "",
        strategy: response.strategy ?? "",
        enabledClients: response.enabled_clients ?? [],
      },
    };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}
