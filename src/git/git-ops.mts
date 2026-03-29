import simpleGit from "simple-git";

import { createLogger } from "../logger/logger.mjs";

const logger = createLogger("git-ops");

/**
 * Initializes a new git repository in the given directory.
 * @param projectDir - Absolute path to the directory to initialize.
 */
export async function initRepo(projectDir: string): Promise<void> {
  const git = simpleGit(projectDir);
  await git.init();
  logger.info("Git repository initialized", { projectDir });
}

/**
 * Stages all changes and creates a commit for a completed feature.
 * @param projectDir - Absolute path to the project directory.
 * @param featureName - Name of the feature being committed.
 * @param message - Commit message (should follow conventional commits).
 * @returns The commit hash.
 */
export async function commitFeature(
  projectDir: string,
  featureName: string,
  message: string
): Promise<string> {
  const git = simpleGit(projectDir);

  await git.add(".");
  const result = await git.commit(message);

  const hash = result.commit;
  logger.info("Feature committed", { featureName, hash, message });
  return hash;
}

/**
 * Rolls back to the previous commit (hard reset HEAD~1).
 * @param projectDir - Absolute path to the project directory.
 */
export async function rollbackToLastCommit(projectDir: string): Promise<void> {
  const git = simpleGit(projectDir);
  await git.reset(["--hard", "HEAD~1"]);
  logger.info("Rolled back to last commit", { projectDir });
}

/**
 * Gets the most recent commit messages.
 * @param projectDir - Absolute path to the project directory.
 * @param count - Number of commits to retrieve.
 * @returns Array of commit messages (newest first).
 */
export async function getRecentCommits(
  projectDir: string,
  count: number
): Promise<string[]> {
  const git = simpleGit(projectDir);
  const log = await git.log({ maxCount: count });
  const messages = log.all.map((entry) => entry.message);
  logger.debug("Retrieved recent commits", { projectDir, count: messages.length });
  return messages;
}
