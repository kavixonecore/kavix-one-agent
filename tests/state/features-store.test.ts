import { join } from "path";

import { describe, it, expect, beforeEach, afterEach } from "bun:test";

import { loadFeatures, saveFeatures, updateFeatureStatus } from "../../src/state/features-store.mjs";

import type { IFeaturesState } from "../../src/state/interfaces/index.mjs";

const TMP_PATH = join(import.meta.dir, "__tmp_features.json");

const baseState: IFeaturesState = {
  projectName: "test-project",
  features: [
    { name: "user", status: "pending" },
    { name: "product", status: "pending" },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(async () => {
  await Bun.write(TMP_PATH, JSON.stringify(baseState, null, 2));
});

afterEach(async () => {
  const file = Bun.file(TMP_PATH);
  if (await file.exists()) {
    await Bun.write(TMP_PATH, "");
  }
});

describe("features-store", () => {
  describe("loadFeatures", () => {
    it("loads and parses a valid features.json", async () => {
      const state = await loadFeatures(TMP_PATH);
      expect(state.projectName)
.toBe("test-project");
      expect(state.features)
.toHaveLength(2);
      expect(state.features[0].name)
.toBe("user");
      expect(state.features[0].status)
.toBe("pending");
    });

    it("throws when file does not exist", async () => {
      await expect(loadFeatures("/nonexistent/path/features.json")).rejects.toThrow(
        "features.json not found at:"
      );
    });
  });

  describe("saveFeatures", () => {
    it("writes state to disk and can be read back", async () => {
      const updated: IFeaturesState = {
        ...baseState,
        projectName: "saved-project",
        updatedAt: "2026-06-01T00:00:00.000Z",
      };
      await saveFeatures(TMP_PATH, updated);

      const reloaded = await loadFeatures(TMP_PATH);
      expect(reloaded.projectName)
.toBe("saved-project");
      expect(reloaded.updatedAt)
.toBe("2026-06-01T00:00:00.000Z");
    });

    it("formats output as pretty-printed JSON", async () => {
      await saveFeatures(TMP_PATH, baseState);
      const raw = await Bun.file(TMP_PATH)
.text();
      expect(raw)
.toContain("\n");
      expect(raw)
.toContain("  ");
    });
  });

  describe("updateFeatureStatus", () => {
    it("sets status to in-progress and records startedAt", async () => {
      await updateFeatureStatus(TMP_PATH, "user", "in-progress");
      const state = await loadFeatures(TMP_PATH);
      const entry = state.features.find((f) => f.name === "user");
      expect(entry?.status)
.toBe("in-progress");
      expect(entry?.startedAt)
.toBeDefined();
    });

    it("sets status to complete and records completedAt", async () => {
      await updateFeatureStatus(TMP_PATH, "user", "complete");
      const state = await loadFeatures(TMP_PATH);
      const entry = state.features.find((f) => f.name === "user");
      expect(entry?.status)
.toBe("complete");
      expect(entry?.completedAt)
.toBeDefined();
    });

    it("sets status to failed and records completedAt", async () => {
      await updateFeatureStatus(TMP_PATH, "product", "failed");
      const state = await loadFeatures(TMP_PATH);
      const entry = state.features.find((f) => f.name === "product");
      expect(entry?.status)
.toBe("failed");
      expect(entry?.completedAt)
.toBeDefined();
    });

    it("updates updatedAt on state", async () => {
      const before = baseState.updatedAt;
      await updateFeatureStatus(TMP_PATH, "user", "in-progress");
      const state = await loadFeatures(TMP_PATH);
      expect(state.updatedAt).not.toBe(before);
    });

    it("throws when feature name does not exist", async () => {
      await expect(updateFeatureStatus(TMP_PATH, "nonexistent", "complete")).rejects.toThrow(
        "Feature \"nonexistent\" not found"
      );
    });
  });
});
