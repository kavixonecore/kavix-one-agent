import type { IFeatureEntry } from "./i-feature-entry.mjs";

/**
 * Top-level state document persisted to features.json.
 * Tracks all features and their statuses for a generation session.
 */
export interface IFeaturesState {

  projectName: string;
  features: IFeatureEntry[];
  createdAt: string;
  updatedAt: string;
}
