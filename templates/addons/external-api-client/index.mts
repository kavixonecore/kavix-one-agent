import { TemplateType } from "../../../src/core/enums/index.mjs";

import type {
  IFeatureSpec,
  IGeneratedFile,
  IGenerationContext,
  IRenderedFile,
  ITemplate,
  IValidationResult,
} from "../../../src/core/interfaces/index.mjs";

/**
 * External API Client addon template.
 * Generates an Axios-based HTTP client service following the Fexa/Smartsheet integration patterns.
 * Includes: token/auth management with OAuth2 caching, retry logic, request/response interfaces,
 * logger integration.
 */
export const externalApiClientTemplate: ITemplate = {

  name: "external-api-client",
  type: TemplateType.ADDON,
  description: "Generates an Axios-based external API client with OAuth2 token caching, retry logic, typed interfaces, and Winston logger integration",

  plan(feature: IFeatureSpec): IGeneratedFile[] {
    const lowerName = feature.name.toLowerCase()
.replace(/\s+/g, "-");
    return [
      {
        path: `src/lib/${lowerName}/service.mts`,
        description: `External API client service for ${feature.name}`,
        templateName: "external-api-client",
        featureName: feature.name,
      },
      {
        path: `src/lib/${lowerName}/interfaces/i-${lowerName}-response.mts`,
        description: `API response type interface for ${feature.name}`,
        templateName: "external-api-client",
        featureName: feature.name,
      },
      {
        path: `src/lib/${lowerName}/interfaces/i-${lowerName}-config.mts`,
        description: `Configuration interface for the ${feature.name} API client`,
        templateName: "external-api-client",
        featureName: feature.name,
      },
      {
        path: `src/lib/${lowerName}/index.mts`,
        description: `Barrel export for ${feature.name} API client module`,
        templateName: "external-api-client",
        featureName: feature.name,
      },
    ];
  },

  render(feature: IFeatureSpec, context: IGenerationContext): IRenderedFile[] {
    const lowerName = feature.name.toLowerCase()
.replace(/\s+/g, "-");
    const pascalName = toPascalCase(feature.name);
    const { projectName } = context;

    return [
      {
        path: `src/lib/${lowerName}/service.mts`,
        content: renderService(lowerName, pascalName, projectName),
        featureName: feature.name,
      },
      {
        path: `src/lib/${lowerName}/interfaces/i-${lowerName}-response.mts`,
        content: renderResponseInterface(lowerName, pascalName),
        featureName: feature.name,
      },
      {
        path: `src/lib/${lowerName}/interfaces/i-${lowerName}-config.mts`,
        content: renderConfigInterface(lowerName, pascalName),
        featureName: feature.name,
      },
      {
        path: `src/lib/${lowerName}/index.mts`,
        content: renderBarrel(lowerName, pascalName),
        featureName: feature.name,
      },
    ];
  },

  validate(files: IRenderedFile[]): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (files.length === 0) {
      errors.push("No files were rendered by the external-api-client addon");
      return { valid: false, errors, warnings };
    }

    const hasService = files.some((f) => f.path.endsWith("/service.mts"));
    const hasResponseInterface = files.some((f) => f.path.includes("interfaces/i-") && f.path.endsWith("-response.mts"));
    const hasConfigInterface = files.some((f) => f.path.includes("interfaces/i-") && f.path.endsWith("-config.mts"));
    const hasBarrel = files.some((f) => f.path.endsWith("/index.mts"));

    if (!hasService) {
      errors.push("Missing service file (service.mts)");
    }
    if (!hasResponseInterface) {
      errors.push("Missing response interface file (interfaces/i-*-response.mts)");
    }
    if (!hasConfigInterface) {
      errors.push("Missing config interface file (interfaces/i-*-config.mts)");
    }
    if (!hasBarrel) {
      errors.push("Missing barrel export (index.mts)");
    }

    for (const file of files) {
      if (!file.content || file.content.trim() === "") {
        errors.push(`File has empty content: ${file.path}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0)
.toUpperCase() + word.slice(1)
.toLowerCase())
    .join("");
}

function renderService(lowerName: string, pascalName: string, projectName: string): string {
  const envPrefix = lowerName.toUpperCase()
.replace(/-/g, "_");
  return `import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import winston from "winston";

import type { I${pascalName}Config } from "./interfaces/i-${lowerName}-config.mjs";
import type { I${pascalName}Response } from "./interfaces/i-${lowerName}-response.mjs";

/**
 * External API client service for ${pascalName}.
 * Axios-based with OAuth2 token caching and retry logic.
 * Based on the Fexa/Smartsheet integration pattern from ${projectName}.
 *
 * Environment variables:
 *   ${envPrefix}_BASE_URL — Base URL for the external API
 *   ${envPrefix}_CLIENT_ID — OAuth2 client ID
 *   ${envPrefix}_CLIENT_SECRET — OAuth2 client secret
 *   ${envPrefix}_TOKEN_URL — OAuth2 token endpoint
 */
export class ${pascalName}Service {

  readonly #config: I${pascalName}Config;

  readonly #logger: winston.Logger;

  readonly #httpClient: AxiosInstance;

  #cachedToken: string | undefined;

  #tokenExpiresAt: number | undefined;

  readonly #MAX_RETRIES = 3;

  readonly #RETRY_DELAY_MS = 1000;

  public constructor(config: I${pascalName}Config, logger: winston.Logger) {
    this.#config = config;
    this.#logger = logger;
    this.#httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs ?? 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
  }

  /**
   * Performs a GET request with automatic token refresh and retry.
   */
  public async get<T extends I${pascalName}Response>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.#requestWithRetry<T>({ method: "GET", url: path, params });
  }

  /**
   * Performs a POST request with automatic token refresh and retry.
   */
  public async post<T extends I${pascalName}Response>(
    path: string,
    data?: unknown
  ): Promise<T> {
    return this.#requestWithRetry<T>({ method: "POST", url: path, data });
  }

  /**
   * Performs a PUT request with automatic token refresh and retry.
   */
  public async put<T extends I${pascalName}Response>(
    path: string,
    data?: unknown
  ): Promise<T> {
    return this.#requestWithRetry<T>({ method: "PUT", url: path, data });
  }

  /**
   * Performs a DELETE request with automatic token refresh and retry.
   */
  public async delete<T extends I${pascalName}Response>(
    path: string
  ): Promise<T> {
    return this.#requestWithRetry<T>({ method: "DELETE", url: path });
  }

  async #requestWithRetry<T>(config: AxiosRequestConfig, attempt = 1): Promise<T> {
    const token = await this.#getToken();
    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config.headers,
        Authorization: \`Bearer \${token}\`,
      },
    };

    try {
      const response: AxiosResponse<T> = await this.#httpClient.request<T>(requestConfig);
      this.#logger.debug("${pascalName}Service request succeeded", {
        method: config.method,
        url: config.url,
        status: response.status,
      });
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      this.#logger.error("${pascalName}Service request failed", {
        method: config.method,
        url: config.url,
        attempt,
        status,
        error: message,
      });

      // Refresh token on 401 and retry once
      if (status === 401 && attempt === 1) {
        this.#cachedToken = undefined;
        this.#tokenExpiresAt = undefined;
        return this.#requestWithRetry<T>(config, attempt + 1);
      }

      if (attempt < this.#MAX_RETRIES && this.#isRetryable(status)) {
        await this.#delay(this.#RETRY_DELAY_MS * attempt);
        return this.#requestWithRetry<T>(config, attempt + 1);
      }

      throw new Error(\`${pascalName}Service: request failed after \${attempt} attempt(s): \${message}\`);
    }
  }

  async #getToken(): Promise<string> {
    const now = Date.now();
    if (
      this.#cachedToken &&
      this.#tokenExpiresAt !== undefined &&
      now < this.#tokenExpiresAt - 60_000
    ) {
      return this.#cachedToken;
    }

    this.#logger.info("${pascalName}Service: fetching new OAuth2 token");

    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.#config.clientId,
      client_secret: this.#config.clientSecret,
    });

    const response = await axios.post<{ access_token: string; expires_in: number }>(
      this.#config.tokenUrl,
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    this.#cachedToken = response.data.access_token;
    this.#tokenExpiresAt = now + response.data.expires_in * 1000;

    this.#logger.info("${pascalName}Service: token refreshed", {
      expiresIn: response.data.expires_in,
    });

    return this.#cachedToken;
  }

  #isRetryable(status: number | undefined): boolean {
    if (status === undefined) return true; // network error
    return status >= 500 || status === 429;
  }

  #delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
`;
}

function renderResponseInterface(lowerName: string, pascalName: string): string {
  return `/**
 * Base response type for ${pascalName} API responses.
 * Extend this interface with the specific fields returned by the API.
 */
export interface I${pascalName}Response {

  id?: string;
  [key: string]: unknown;
}
`;
}

function renderConfigInterface(lowerName: string, pascalName: string): string {
  return `/**
 * Configuration for the ${pascalName} external API client.
 */
export interface I${pascalName}Config {

  /** Base URL of the external API (e.g. https://api.example.com/v1) */
  baseUrl: string;

  /** OAuth2 client ID */
  clientId: string;

  /** OAuth2 client secret */
  clientSecret: string;

  /** OAuth2 token endpoint URL */
  tokenUrl: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
}
`;
}

function renderBarrel(lowerName: string, pascalName: string): string {
  return `export { ${pascalName}Service } from "./service.mjs";
export type { I${pascalName}Config } from "./interfaces/i-${lowerName}-config.mjs";
export type { I${pascalName}Response } from "./interfaces/i-${lowerName}-response.mjs";
`;
}
