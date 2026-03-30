import { ManagementClient } from "auth0";
import { getEnv } from "../config/env.mjs";

let client: ManagementClient | null = null;

export function getAuth0Client(): ManagementClient {
  if (client) return client;
  const env = getEnv();
  client = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
  });
  return client;
}

export function resetAuth0Client(): void {
  client = null;
}
