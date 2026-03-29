import { createLogger } from "../logger/logger.mjs";

import type { GenerationStatus } from "../core/types/index.mjs";
import type { IFeaturesState } from "./interfaces/index.mjs";

const logger = createLogger("features-store");

/**
 * Loads the features state from a JSON file.
 * @param path - Absolute path to features.json
 */
export async function loadFeatures(path: string): Promise<IFeaturesState> {
  const file = Bun.file(path);
  const exists = await file.exists();
  if (!exists) {
    throw new Error(`features.json not found at: ${path}`);
  }
  const text = await file.text();
  const parsed = JSON.parse(text) as IFeaturesState;
  logger.debug("Loaded features state", { path, features: parsed.features.length });
  return parsed;
}

/**
 * Persists the features state to a JSON file.
 * @param path - Absolute path to features.json
 * @param state - State to write
 */
export async function saveFeatures(path: string, state: IFeaturesState): Promise<void> {
  const json = JSON.stringify(state, null, 2);
  await Bun.write(path, json);
  logger.debug("Saved features state", { path, features: state.features.length });
}

/**
 * Updates the status of a single feature in the persisted state.
 * @param path - Absolute path to features.json
 * @param featureName - Name of the feature to update
 * @param status - New status
 */
export async function updateFeatureStatus(
  path: string,
  featureName: string,
  status: GenerationStatus
): Promise<void> {
  const state = await loadFeatures(path);
  const entry = state.features.find((f) => f.name === featureName);
  if (!entry) {
    throw new Error(`Feature "${featureName}" not found in features state`);
  }

  entry.status = status;

  if (status === "in-progress" && !entry.startedAt) {
    entry.startedAt = new Date()
.toISOString();
  }

  if (status === "complete" || status === "failed") {
    entry.completedAt = new Date()
.toISOString();
  }

  state.updatedAt = new Date()
.toISOString();
  await saveFeatures(path, state);
  logger.info("Updated feature status", { featureName, status });
}
