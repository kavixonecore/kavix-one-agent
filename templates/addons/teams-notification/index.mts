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
 * Teams Notification addon template.
 * Generates a Teams notification service following the @sylvesterllc/utils
 * TeamsNotificationService pattern.
 * Includes: Adaptive Card builder, webhook sender, error/success notification helpers.
 */
export const teamsNotificationTemplate: ITemplate = {

  name: "teams-notification",
  type: TemplateType.ADDON,
  description: "Generates a Microsoft Teams notification service with Adaptive Card builder, webhook sender, and error/success notification helpers",

  plan(feature: IFeatureSpec): IGeneratedFile[] {
    return [
      {
        path: "src/lib/teams/teams-notification-service.mts",
        description: "Teams notification service with Adaptive Card support",
        templateName: "teams-notification",
        featureName: feature.name,
      },
      {
        path: "src/lib/teams/interfaces/i-adaptive-card.mts",
        description: "Adaptive Card schema interface",
        templateName: "teams-notification",
        featureName: feature.name,
      },
      {
        path: "src/lib/teams/index.mts",
        description: "Barrel export for the teams module",
        templateName: "teams-notification",
        featureName: feature.name,
      },
    ];
  },

  render(feature: IFeatureSpec, context: IGenerationContext): IRenderedFile[] {
    const { projectName } = context;
    return [
      {
        path: "src/lib/teams/teams-notification-service.mts",
        content: renderTeamsService(projectName),
        featureName: feature.name,
      },
      {
        path: "src/lib/teams/interfaces/i-adaptive-card.mts",
        content: renderAdaptiveCardInterface(),
        featureName: feature.name,
      },
      {
        path: "src/lib/teams/index.mts",
        content: renderBarrel(),
        featureName: feature.name,
      },
    ];
  },

  validate(files: IRenderedFile[]): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const expected = [
      "src/lib/teams/teams-notification-service.mts",
      "src/lib/teams/interfaces/i-adaptive-card.mts",
      "src/lib/teams/index.mts",
    ];

    for (const path of expected) {
      if (!files.some((f) => f.path === path)) {
        errors.push(`Missing required file: ${path}`);
      }
    }

    for (const file of files) {
      if (!file.content || file.content.trim() === "") {
        errors.push(`File has empty content: ${file.path}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

function renderTeamsService(projectName: string): string {
  return `import axios from "axios";
import winston from "winston";

import type { IAdaptiveCard, IAdaptiveCardBody } from "./interfaces/i-adaptive-card.mjs";

/**
 * Teams notification service for ${projectName}.
 * Sends Adaptive Card messages to Microsoft Teams via an Incoming Webhook.
 * Based on the @sylvesterllc/utils TeamsNotificationService pattern.
 *
 * Environment variables:
 *   TEAMS_WEBHOOK_URL — Microsoft Teams Incoming Webhook URL
 */
export class TeamsNotificationService {

  readonly #webhookUrl: string;

  readonly #logger: winston.Logger;

  readonly #projectName: string;

  public constructor(
    webhookUrl: string,
    logger: winston.Logger,
    projectName = "${projectName}"
  ) {
    this.#webhookUrl = webhookUrl;
    this.#logger = logger;
    this.#projectName = projectName;
  }

  /**
   * Sends a success notification card to Teams.
   */
  public async notifySuccess(
    title: string,
    message: string,
    details?: Record<string, string>
  ): Promise<boolean> {
    const card = this.#buildCard({
      title,
      message,
      color: "00C853",
      icon: "✅",
      details,
    });
    return this.#send(card);
  }

  /**
   * Sends an error notification card to Teams.
   */
  public async notifyError(
    title: string,
    error: string | Error,
    context?: Record<string, string>
  ): Promise<boolean> {
    const errorMessage = error instanceof Error ? error.message : error;
    const card = this.#buildCard({
      title,
      message: errorMessage,
      color: "D32F2F",
      icon: "❌",
      details: context,
    });
    return this.#send(card);
  }

  /**
   * Sends an informational notification card to Teams.
   */
  public async notifyInfo(
    title: string,
    message: string,
    details?: Record<string, string>
  ): Promise<boolean> {
    const card = this.#buildCard({
      title,
      message,
      color: "1976D2",
      icon: "ℹ️",
      details,
    });
    return this.#send(card);
  }

  /**
   * Sends a fully custom Adaptive Card to Teams.
   */
  public async sendCard(card: IAdaptiveCard): Promise<boolean> {
    return this.#send(card);
  }

  #buildCard(opts: {
    title: string;
    message: string;
    color: string;
    icon: string;
    details?: Record<string, string>;
  }): IAdaptiveCard {
    const body: IAdaptiveCardBody[] = [
      {
        type: "TextBlock",
        text: \`\${opts.icon} \${opts.title}\`,
        weight: "Bolder",
        size: "Medium",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: opts.message,
        wrap: true,
      },
      {
        type: "TextBlock",
        text: \`Project: \${this.#projectName} | \${new Date().toISOString()}\`,
        size: "Small",
        isSubtle: true,
        wrap: true,
      },
    ];

    if (opts.details && Object.keys(opts.details).length > 0) {
      const factSet: IAdaptiveCardBody = {
        type: "FactSet",
        facts: Object.entries(opts.details).map(([title, value]) => ({ title, value })),
      };
      body.push(factSet);
    }

    return {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            msteams: { width: "Full" },
            body,
            msTeams: { accentColor: opts.color },
          },
        },
      ],
    };
  }

  async #send(card: IAdaptiveCard): Promise<boolean> {
    try {
      await axios.post(this.#webhookUrl, card, {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      });
      this.#logger.info("TeamsNotificationService: card sent successfully");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.#logger.error("TeamsNotificationService: failed to send card", { error: message });
      return false;
    }
  }
}
`;
}

function renderAdaptiveCardInterface(): string {
  return `/**
 * Adaptive Card fact (key-value pair) for FactSet body elements.
 */
export interface IAdaptiveCardFact {

  title: string;
  value: string;
}

/**
 * A single body element inside an Adaptive Card content block.
 */
export interface IAdaptiveCardBody {

  type: "TextBlock" | "FactSet" | "Container" | "Image" | string;
  text?: string;
  weight?: "Default" | "Lighter" | "Bolder";
  size?: "Default" | "Small" | "Medium" | "Large" | "ExtraLarge";
  wrap?: boolean;
  isSubtle?: boolean;
  facts?: IAdaptiveCardFact[];
  [key: string]: unknown;
}

/**
 * Content block of a Microsoft Adaptive Card (v1.4).
 */
export interface IAdaptiveCardContent {

  "$schema": string;
  type: "AdaptiveCard";
  version: string;
  body: IAdaptiveCardBody[];
  msteams?: { width?: "Full" | "Default" };
  msTeams?: { accentColor?: string };
  [key: string]: unknown;
}

/**
 * Attachment wrapper used by Teams Incoming Webhook requests.
 */
export interface IAdaptiveCardAttachment {

  contentType: "application/vnd.microsoft.card.adaptive";
  content: IAdaptiveCardContent;
}

/**
 * Top-level Teams webhook message payload containing an Adaptive Card.
 */
export interface IAdaptiveCard {

  type: "message";
  attachments: IAdaptiveCardAttachment[];
}
`;
}

function renderBarrel(): string {
  return `export { TeamsNotificationService } from "./teams-notification-service.mjs";
export type { IAdaptiveCard } from "./interfaces/i-adaptive-card.mjs";
export type { IAdaptiveCardBody } from "./interfaces/i-adaptive-card.mjs";
export type { IAdaptiveCardContent } from "./interfaces/i-adaptive-card.mjs";
export type { IAdaptiveCardFact } from "./interfaces/i-adaptive-card.mjs";
`;
}
