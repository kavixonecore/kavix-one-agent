import { createInterface } from "readline";

import { createLogger } from "../logger/logger.mjs";

const logger = createLogger("terminal");

/**
 * Presents a question to the user via stdin and returns their response.
 * @param question - The question or message to display.
 */
export async function askTerminal(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(`${question}\n> `, (answer) => {
      rl.close();
      logger.debug("User answered terminal question", { questionLength: question.length });
      resolve(answer.trim());
    });
  });
}

/**
 * Presents a yes/no confirmation prompt and returns the boolean result.
 * Accepts "y", "yes" (case-insensitive) as true; anything else as false.
 * @param message - The confirmation message to display.
 */
export async function confirmTerminal(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question(`${message} [y/N]: `, (answer) => {
      rl.close();
      const result = answer.trim()
.toLowerCase() === "y" || answer.trim()
.toLowerCase() === "yes";
      logger.debug("User confirmed terminal prompt", { result });
      resolve(result);
    });
  });
}

/**
 * Presents a review checkpoint for a feature and returns the user's decision.
 * Displays the list of generated files and prompts for approve / reject / skip.
 * @param featureName - Name of the feature being reviewed.
 * @param files - Array of file paths that were generated.
 */
export async function reviewTerminal(
  featureName: string,
  files: string[]
): Promise<"approve" | "reject" | "skip"> {
  const fileList = files.map((f) => `  - ${f}`)
.join("\n");
  const prompt = [
    `\nReview checkpoint — Feature: ${featureName}`,
    `Generated files:`,
    fileList,
    `\nChoose: [a]pprove / [r]eject (re-render) / [s]kip`,
  ].join("\n");

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<"approve" | "reject" | "skip">((resolve) => {
    rl.question(`${prompt}\n> `, (answer) => {
      rl.close();
      const normalized = answer.trim()
.toLowerCase();
      if (normalized === "a" || normalized === "approve") {
        logger.info("Feature approved at review checkpoint", { featureName });
        resolve("approve");
      } else if (normalized === "r" || normalized === "reject") {
        logger.info("Feature rejected at review checkpoint", { featureName });
        resolve("reject");
      } else {
        logger.info("Feature skipped at review checkpoint", { featureName });
        resolve("skip");
      }
    });
  });
}
