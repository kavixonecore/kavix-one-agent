import { createApp } from "./app.mjs";
import { getContainer } from "./shared/container.mjs";
import { closeMongoClient } from "./shared/database.mjs";
import { logger } from "./shared/logger.mjs";

const port = parseInt(process.env["PORT"] ?? "3000", 10);

const start = async (): Promise<void> => {
  const container = await getContainer();

  const app = createApp(container);

  app.listen(port, () => {
    logger.info("Fitness Tracker API started", { port });
  });

  const shutdown = async (): Promise<void> => {
    logger.info("Shutting down server...");
    await closeMongoClient();
    process.exit(0);
  };

  process.on("SIGINT", () => { void shutdown(); });
  process.on("SIGTERM", () => { void shutdown(); });
};

void start();
