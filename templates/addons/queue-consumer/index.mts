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
 * Queue Consumer addon template.
 * Generates an Azure Storage Queue consumer service following the ct-ai-photo-qc pattern:
 * poll-based consumer, Zod message validation, graceful shutdown, health check endpoint.
 */
export const queueConsumerTemplate: ITemplate = {

  name: "queue-consumer",
  type: TemplateType.ADDON,
  description: "Generates an Azure Storage Queue consumer service with poll-based processing, Zod message validation, graceful shutdown, and health check endpoint",

  plan(feature: IFeatureSpec): IGeneratedFile[] {
    const lowerName = feature.name.toLowerCase()
.replace(/\s+/g, "-");
    return [
      {
        path: `src/consumers/${lowerName}-consumer.mts`,
        description: `Azure Storage Queue consumer for ${feature.name}`,
        templateName: "queue-consumer",
        featureName: feature.name,
      },
      {
        path: `src/consumers/interfaces/i-${lowerName}-message.mts`,
        description: `Message shape for the ${feature.name} queue consumer`,
        templateName: "queue-consumer",
        featureName: feature.name,
      },
    ];
  },

  render(feature: IFeatureSpec, context: IGenerationContext): IRenderedFile[] {
    const { projectName } = context;
    const lowerName = feature.name.toLowerCase()
.replace(/\s+/g, "-");
    const pascalName = toPascalCase(feature.name);

    return [
      {
        path: `src/consumers/${lowerName}-consumer.mts`,
        content: renderConsumer(lowerName, pascalName, projectName),
        featureName: feature.name,
      },
      {
        path: `src/consumers/interfaces/i-${lowerName}-message.mts`,
        content: renderMessageInterface(lowerName, pascalName),
        featureName: feature.name,
      },
    ];
  },

  validate(files: IRenderedFile[]): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (files.length === 0) {
      errors.push("No files were rendered by the queue-consumer addon");
      return { valid: false, errors, warnings };
    }

    const hasConsumer = files.some((f) => f.path.endsWith("-consumer.mts"));
    const hasInterface = files.some((f) => f.path.includes("interfaces/i-") && f.path.endsWith("-message.mts"));

    if (!hasConsumer) {
      errors.push("Missing consumer file (*-consumer.mts)");
    }
    if (!hasInterface) {
      errors.push("Missing message interface file (interfaces/i-*-message.mts)");
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

function renderConsumer(lowerName: string, pascalName: string, projectName: string): string {
  return `import { QueueServiceClient } from "@azure/storage-queue";
import winston from "winston";
import Elysia from "elysia";
import { z } from "zod";

import type { I${pascalName}Message } from "./interfaces/i-${lowerName}-message.mjs";

/**
 * ${pascalName} Queue Consumer.
 * Polls an Azure Storage Queue and processes messages with Zod validation.
 * Follows the ct-ai-photo-qc poll-based consumer pattern.
 *
 * Environment variables required:
 *   AZURE_STORAGE_CONNECTION_STRING — Azure Storage connection string
 *   ${lowerName.toUpperCase()
.replace(/-/g, "_")}_QUEUE_NAME — Queue name (default: "${lowerName}-queue")
 *   ${lowerName.toUpperCase()
.replace(/-/g, "_")}_POLL_INTERVAL_MS — Poll interval in ms (default: 5000)
 */
export class ${pascalName}Consumer {

  readonly #queueClient: QueueServiceClient;

  readonly #queueName: string;

  readonly #pollIntervalMs: number;

  readonly #logger: winston.Logger;

  #isRunning = false;

  #intervalHandle: ReturnType<typeof setInterval> | undefined;

  public constructor(
    connectionString: string,
    queueName: string,
    pollIntervalMs: number,
    logger: winston.Logger
  ) {
    this.#queueClient = QueueServiceClient.fromConnectionString(connectionString);
    this.#queueName = queueName;
    this.#pollIntervalMs = pollIntervalMs;
    this.#logger = logger;
  }

  public start(): void {
    if (this.#isRunning) {
      this.#logger.warn("${pascalName}Consumer is already running");
      return;
    }

    this.#isRunning = true;
    this.#logger.info("Starting ${pascalName}Consumer", {
      queue: this.#queueName,
      pollIntervalMs: this.#pollIntervalMs,
    });

    this.#intervalHandle = setInterval(() => {
      this.#poll().catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.#logger.error("${pascalName}Consumer poll error", { error: message });
      });
    }, this.#pollIntervalMs);

    process.on("SIGTERM", () => this.stop());
    process.on("SIGINT", () => this.stop());
  }

  public stop(): void {
    if (!this.#isRunning) return;

    this.#isRunning = false;
    if (this.#intervalHandle !== undefined) {
      clearInterval(this.#intervalHandle);
      this.#intervalHandle = undefined;
    }

    this.#logger.info("${pascalName}Consumer stopped gracefully");
  }

  public isRunning(): boolean {
    return this.#isRunning;
  }

  async #poll(): Promise<void> {
    const client = this.#queueClient.getQueueClient(this.#queueName);

    const response = await client.receiveMessages({ numberOfMessages: 5 });

    if (!response.receivedMessageItems || response.receivedMessageItems.length === 0) {
      this.#logger.debug("${pascalName}Consumer: no messages in queue");
      return;
    }

    for (const item of response.receivedMessageItems) {
      await this.#processMessage(
        item.messageId,
        item.popReceipt,
        item.messageText,
        client
      );
    }
  }

  async #processMessage(
    messageId: string,
    popReceipt: string,
    rawText: string,
    client: ReturnType<QueueServiceClient["getQueueClient"]>
  ): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(rawText, "base64").toString("utf-8"));
    } catch {
      this.#logger.error("${pascalName}Consumer: failed to parse message", { messageId });
      await client.deleteMessage(messageId, popReceipt);
      return;
    }

    const validation = ${lowerName.replace(/-/g, "")}MessageSchema.safeParse(parsed);
    if (!validation.success) {
      this.#logger.error("${pascalName}Consumer: invalid message schema", {
        messageId,
        errors: validation.error.flatten(),
      });
      await client.deleteMessage(messageId, popReceipt);
      return;
    }

    const message = validation.data as I${pascalName}Message;
    this.#logger.info("${pascalName}Consumer: processing message", { messageId, message });

    try {
      await this.#handle(message);
      await client.deleteMessage(messageId, popReceipt);
      this.#logger.info("${pascalName}Consumer: message processed successfully", { messageId });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.#logger.error("${pascalName}Consumer: message processing failed", {
        messageId,
        error: errorMessage,
      });
      // Do not delete — allow retry / DLQ handling
    }
  }

  /**
   * Override this method to implement the business logic for each message.
   */
  async #handle(message: I${pascalName}Message): Promise<void> {
    this.#logger.info("${pascalName}Consumer: handle()", { message });
    // TODO: implement message handling logic for ${projectName}
  }
}

// ---------------------------------------------------------------------------
// Zod schema — matches the I${pascalName}Message interface
// ---------------------------------------------------------------------------
const ${lowerName.replace(/-/g, "")}MessageSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  payload: z.record(z.unknown()),
  timestamp: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// Health check Elysia plugin
// ---------------------------------------------------------------------------
export function create${pascalName}HealthPlugin(consumer: ${pascalName}Consumer): Elysia {
  return new Elysia({ prefix: "/health/${lowerName}" }).get("/", () => ({
    status: consumer.isRunning() ? "running" : "stopped",
    consumer: "${lowerName}",
    timestamp: new Date().toISOString(),
  }));
}
`;
}

function renderMessageInterface(lowerName: string, pascalName: string): string {
  return `/**
 * Message shape for the ${pascalName} queue consumer.
 * Extend this interface with the properties your queue messages contain.
 */
export interface I${pascalName}Message {

  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}
`;
}
