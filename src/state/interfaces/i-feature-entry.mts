import type { GenerationStatus } from "../../core/types/index.mjs";

/**
 * Tracks the runtime status of a single feature in the generation session.
 */
export interface IFeatureEntry {

  name: string;
  status: GenerationStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}
