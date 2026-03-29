import { join } from "path";

import { createLogger } from "./logger/logger.mjs";
import { parseArgs } from "./input/cli.mjs";
import { runGeneration } from "./runner.mjs";
import { askTerminal, confirmTerminal, reviewTerminal } from "./input/terminal.mjs";
import { loadFeatures } from "./state/features-store.mjs";
import { reportPlan, reportStatus, reportSummary } from "./output/console-reporter.mjs";
import { getTraces } from "./trace/index.mjs";
import { generateSummary } from "./trace/summary-reporter.mjs";
import { writeTraceToFs } from "./trace/trace-writer-fs.mjs";

import type { ICliCommand } from "./input/interfaces/index.mjs";
import type { ReviewResponse } from "./generation/engine.mjs";

const logger = createLogger("cli-entry");

async function main(): Promise<void> {
  let command;

  try {
    command = parseArgs(process.argv.slice(2));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(message);
    process.exit(1);
  }

  switch (command.command) {
    case "generate":
      await handleGenerate(command);
      break;
    case "resume":
      await handleResume();
      break;
    case "status":
      await handleStatus();
      break;
    case "trace":
      await handleTrace(command);
      break;
    default:
      logger.error("Unknown command");
      process.exit(1);
  }
}

async function handleGenerate(command: ICliCommand): Promise<void> {
  const projectName = command.projectName;

  if (!projectName) {
    logger.error("generate requires a project name");
    process.exit(1);
  }

  if (!command.prompt && !command.prdPath && !command.interactive) {
    logger.error("generate requires --prompt, --prd, or --interactive");
    process.exit(1);
  }

  const outputDir = join(process.cwd(), projectName);

  const reviewCallback = async (
    featureName: string,
    files: string[]
  ): Promise<ReviewResponse> => {
    return reviewTerminal(featureName, files);
  };

  const result = await runGeneration({
    projectName,
    outputDir,
    prompt: command.prompt,
    prdPath: command.prdPath,
    interactive: command.interactive,
    dryRun: command.dryRun,
    askQuestion: askTerminal,
    onReviewCheckpoint: reviewCallback,
    onProgress: (msg) => logger.info(msg),
  });

  if (result.plan && command.dryRun) {
    reportPlan(result.plan);
    logger.info("Dry-run complete. No files written.");
    process.exit(0);
  }

  if (result.summary) {
    reportSummary(result.summary);
  }

  if (!result.success) {
    logger.error("Generation failed", {
      featuresFailed: result.featuresFailed,
    });
    process.exit(1);
  }

  logger.info("Generation succeeded", {
    featuresCompleted: result.featuresCompleted,
    outputDir,
  });
  process.exit(0);
}

async function handleResume(): Promise<void> {
  const featuresPath = join(process.cwd(), "features.json");
  const file = Bun.file(featuresPath);

  const exists = await file.exists();
  if (!exists) {
    logger.error("No features.json found in the current directory. Nothing to resume.");
    process.exit(1);
  }

  let state;

  try {
    state = await loadFeatures(featuresPath);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Failed to load features state", { error: message });
    process.exit(1);
  }

  const pendingFeatures = state.features.filter(
    (f) => f.status === "pending" || f.status === "in-progress"
  );

  if (pendingFeatures.length === 0) {
    logger.info("All features are complete. Nothing to resume.");
    process.exit(0);
  }

  const shouldContinue = await confirmTerminal(
    `Resume generation for ${state.projectName}? (${pendingFeatures.length} pending features)`
  );

  if (!shouldContinue) {
    logger.info("Resume cancelled by user.");
    process.exit(0);
  }

  const outputDir = process.cwd();

  const reviewCallback = async (
    featureName: string,
    files: string[]
  ): Promise<ReviewResponse> => {
    return reviewTerminal(featureName, files);
  };

  // For resume, we reconstruct minimal feature specs from state names
  // and rely on a prompt or PRD being available
  logger.info("Resuming generation...", {
    projectName: state.projectName,
    pendingFeatures: pendingFeatures.map((f) => f.name),
  });

  // Resume uses a no-op prompt that tells the user what happened
  const result = await runGeneration({
    projectName: state.projectName,
    outputDir,
    prdContent: buildResumePrd(state.projectName, pendingFeatures.map((f) => f.name)),
    askQuestion: askTerminal,
    onReviewCheckpoint: reviewCallback,
    onProgress: (msg) => logger.info(msg),
  });

  if (result.summary) {
    reportSummary(result.summary);
  }

  process.exit(result.success ? 0 : 1);
}

function buildResumePrd(projectName: string, featureNames: string[]): string {
  const checkboxes = featureNames.map((name) => `- [ ] ${name}`)
.join("\n");
  return `# PRD: ${projectName}\n\n## Features\n\n${checkboxes}\n`;
}

async function handleStatus(): Promise<void> {
  const featuresPath = join(process.cwd(), "features.json");
  const file = Bun.file(featuresPath);

  const exists = await file.exists();
  if (!exists) {
    logger.error("No features.json found in the current directory.");
    process.exit(1);
  }

  let state;

  try {
    state = await loadFeatures(featuresPath);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Failed to load features state", { error: message });
    process.exit(1);
  }

  reportStatus(state);
  process.exit(0);
}

async function handleTrace(command: ICliCommand): Promise<void> {
  if (command.useMongo) {
    await handleTraceMongo(command.sessionId);
    return;
  }

  // Read .docs/*.md files from current directory
  const docsDir = join(process.cwd(), ".docs");
  const glob = new Bun.Glob("*.md");

  const files: string[] = [];
  for await (const file of glob.scan({ cwd: docsDir, absolute: true })) {
    files.push(file);
  }

  if (files.length === 0) {
    logger.info("No trace files found in .docs/ directory.");
    process.exit(0);
  }

  files.sort();

  for (const filePath of files) {
    const content = await Bun.file(filePath)
.text();
    logger.info(`\n--- Trace: ${filePath} ---\n${content}`);
  }

  process.exit(0);
}

async function handleTraceMongo(sessionId?: string): Promise<void> {
  try {
    const { env } = await import("./config/env.mjs");

    const mongoConnStr = `mongodb+srv://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@${env.MONGO_HOSTNAME}`;

    const traces = await getTraces(mongoConnStr, "agent-one", sessionId);

    if (traces.length === 0) {
      logger.info("No traces found in MongoDB.");
      process.exit(0);
    }

    const outputDir = join(process.cwd(), ".docs");

    for (const trace of traces) {
      const filePath = await writeTraceToFs(outputDir, trace);
      logger.info("Wrote trace from MongoDB", { filePath, traceId: trace.traceId });
    }

    const summary = generateSummary(traces);
    reportSummary(summary);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Failed to query MongoDB traces", { error: message });
    process.exit(1);
  }
}

// Run main and handle top-level async errors
main()
.catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error("Unhandled error in CLI", { error: message });
  process.exit(1);
});
