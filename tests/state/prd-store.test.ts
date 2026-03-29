import { join } from "path";

import { describe, it, expect, beforeEach, afterEach } from "bun:test";

import { loadPrd, checkFeature } from "../../src/state/prd-store.mjs";

const TMP_PATH = join(import.meta.dir, "__tmp_prd.md");

const samplePrd = `# PRD: Test Project

## Features

- [ ] user-management
- [ ] product-catalog
- [x] already-done
`;

beforeEach(async () => {
  await Bun.write(TMP_PATH, samplePrd);
});

afterEach(async () => {
  const file = Bun.file(TMP_PATH);
  if (await file.exists()) {
    await Bun.write(TMP_PATH, "");
  }
});

describe("prd-store", () => {
  describe("loadPrd", () => {
    it("loads and returns the PRD markdown content", async () => {
      const content = await loadPrd(TMP_PATH);
      expect(content)
.toContain("# PRD: Test Project");
      expect(content)
.toContain("- [ ] user-management");
    });

    it("throws when file does not exist", async () => {
      await expect(loadPrd("/nonexistent/path/prd.md")).rejects.toThrow(
        "PRD file not found at:"
      );
    });
  });

  describe("checkFeature", () => {
    it("replaces unchecked checkbox with checked checkbox", async () => {
      await checkFeature(TMP_PATH, "user-management");
      const content = await loadPrd(TMP_PATH);
      expect(content)
.toContain("- [x] user-management");
      expect(content).not.toContain("- [ ] user-management");
    });

    it("does not modify already-checked features", async () => {
      await checkFeature(TMP_PATH, "already-done");
      const content = await loadPrd(TMP_PATH);
      expect(content)
.toContain("- [x] already-done");
    });

    it("does not modify other unchecked features", async () => {
      await checkFeature(TMP_PATH, "user-management");
      const content = await loadPrd(TMP_PATH);
      expect(content)
.toContain("- [ ] product-catalog");
    });

    it("handles feature name not found without throwing", async () => {
      await expect(checkFeature(TMP_PATH, "nonexistent-feature")).resolves.toBeUndefined();
    });

    it("handles special regex characters in feature names", async () => {
      const specialPrd = `# PRD\n- [ ] feature.with(parens)\n`;
      await Bun.write(TMP_PATH, specialPrd);
      await checkFeature(TMP_PATH, "feature.with(parens)");
      const content = await loadPrd(TMP_PATH);
      expect(content)
.toContain("- [x] feature.with(parens)");
    });
  });
});
