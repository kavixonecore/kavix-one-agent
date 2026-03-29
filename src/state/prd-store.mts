import { createLogger } from "../logger/logger.mjs";

const logger = createLogger("prd-store");

/**
 * Loads the PRD markdown content from a file.
 * @param path - Absolute path to the PRD markdown file
 */
export async function loadPrd(path: string): Promise<string> {
  const file = Bun.file(path);
  const exists = await file.exists();
  if (!exists) {
    throw new Error(`PRD file not found at: ${path}`);
  }
  const text = await file.text();
  logger.debug("Loaded PRD", { path, bytes: text.length });
  return text;
}

/**
 * Marks a feature as complete in the PRD by replacing its unchecked checkbox.
 * Replaces `- [ ] featureName` with `- [x] featureName`.
 * @param path - Absolute path to the PRD markdown file
 * @param featureName - The feature name text to find and check
 */
export async function checkFeature(path: string, featureName: string): Promise<void> {
  const content = await loadPrd(path);
  const escaped = escapeRegex(featureName);
  const pattern = new RegExp(`- \\[ \\] ${escaped}`, "g");
  const updated = content.replace(pattern, `- [x] ${featureName}`);

  if (updated === content) {
    logger.warn("No unchecked checkbox found for feature", { featureName, path });
  } else {
    await Bun.write(path, updated);
    logger.info("Checked feature in PRD", { featureName, path });
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
