import { createLogger } from "../logger/logger.mjs";

import type { ICliCommand } from "./interfaces/index.mjs";

const logger = createLogger("cli");

/**
 * Parses process argv into a typed CLI command.
 *
 * Supported forms: generate, resume, status, trace.
 *
 * @param argv - Process argv array (e.g. process.argv.slice(2))
 * @throws {Error} When the command is missing, unrecognised, or required args are absent
 */
export function parseArgs(argv: string[]): ICliCommand {
  const args = [...argv];

  if (args.length === 0) {
    throw new Error(
      "No command provided. Usage: agent-one <generate|resume|status|trace> [options]"
    );
  }

  const command = args.shift() as string;

  if (command !== "generate" && command !== "resume" && command !== "status" && command !== "trace") {
    throw new Error(
      `Unknown command: "${command}". Valid commands: generate, resume, status, trace`
    );
  }

  if (command === "resume" || command === "status") {
    logger.debug("Parsed CLI command", { command });
    return { command };
  }

  if (command === "trace") {
    let sessionId: string | undefined;
    let useMongo = false;

    while (args.length > 0) {
      const flag = args.shift() as string;
      if (flag === "--session") {
        const value = args.shift();
        if (!value) {
          throw new Error("--session requires a session ID value");
        }
        sessionId = value;
      } else if (flag === "--mongo") {
        useMongo = true;
      } else {
        throw new Error(
          `Unknown flag: "${flag}". Supported flags for trace: --session, --mongo`
        );
      }
    }

    const result: ICliCommand = { command };
    if (sessionId !== undefined) {
result.sessionId = sessionId;
}
    if (useMongo) {
result.useMongo = true;
}

    logger.debug("Parsed CLI command", { command, sessionId, useMongo });
    return result;
  }

  // generate command
  const projectName = args[0] && !args[0].startsWith("--") ? args.shift() : undefined;
  if (!projectName) {
    throw new Error(
      "generate requires a project name. Usage: agent-one generate <projectName> [--prompt \"...\"] [--prd <path>] [--interactive]"
    );
  }

  let prompt: string | undefined;
  let prdPath: string | undefined;
  let interactive = false;
  let dryRun = false;

  while (args.length > 0) {
    const flag = args.shift() as string;

    if (flag === "--prompt") {
      const value = args.shift();
      if (!value) {
        throw new Error("--prompt requires a value");
      }
      prompt = value;
    } else if (flag === "--prd") {
      const value = args.shift();
      if (!value) {
        throw new Error("--prd requires a file path");
      }
      prdPath = value;
    } else if (flag === "--interactive") {
      interactive = true;
    } else if (flag === "--dry-run") {
      dryRun = true;
    } else {
      throw new Error(
        `Unknown flag: "${flag}". Supported flags for generate: --prompt, --prd, --interactive, --dry-run`
      );
    }
  }

  const result: ICliCommand = {
    command,
    projectName,
    interactive,
    dryRun,
  };

  if (prompt !== undefined) {
    result.prompt = prompt;
  }
  if (prdPath !== undefined) {
    result.prdPath = prdPath;
  }

  logger.debug("Parsed CLI command", {
    command,
    projectName,
    hasPrompt: !!prompt,
    hasPrd: !!prdPath,
    interactive,
    dryRun,
  });
  return result;
}
