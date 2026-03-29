import { join } from "path";

import { describe, it, expect, beforeEach, afterEach } from "bun:test";

import { initRepo, commitFeature, rollbackToLastCommit, getRecentCommits } from "../../src/git/git-ops.mjs";

const TMP_DIR = join(import.meta.dir, "__tmp_git_repo");

async function createTmpDir(): Promise<void> {
  // Create the directory by writing a placeholder file
  await Bun.write(join(TMP_DIR, ".gitkeep"), "");
}

async function removeTmpDir(): Promise<void> {
  // Clean up by removing all files in the directory
  const { $ } = await import("bun");
  await $`rm -rf ${TMP_DIR}`.quiet();
}

beforeEach(async () => {
  await removeTmpDir();
  await createTmpDir();
});

afterEach(async () => {
  await removeTmpDir();
});

describe("initRepo", () => {
  it("creates a .git directory in the given path", async () => {
    await initRepo(TMP_DIR);

    const gitDir = Bun.file(join(TMP_DIR, ".git", "HEAD"));
    expect(await gitDir.exists())
.toBe(true);
  });
});

describe("commitFeature", () => {
  it("creates a commit and returns a hash", async () => {
    await initRepo(TMP_DIR);

    // Configure git for the test repo
    const { $ } = await import("bun");
    await $`git -C ${TMP_DIR} config user.email "test@test.com"`.quiet();
    await $`git -C ${TMP_DIR} config user.name "Test User"`.quiet();

    // Write a file to commit
    await Bun.write(join(TMP_DIR, "feature.ts"), "export const x = 1;");

    const hash = await commitFeature(TMP_DIR, "user", "feat: add user feature");

    expect(hash)
.toBeTruthy();
    expect(typeof hash)
.toBe("string");
  });
});

describe("getRecentCommits", () => {
  it("returns commit messages for recent commits", async () => {
    await initRepo(TMP_DIR);

    const { $ } = await import("bun");
    await $`git -C ${TMP_DIR} config user.email "test@test.com"`.quiet();
    await $`git -C ${TMP_DIR} config user.name "Test User"`.quiet();

    // Create two commits
    await Bun.write(join(TMP_DIR, "file1.ts"), "const a = 1;");
    await commitFeature(TMP_DIR, "user", "feat: first commit");

    await Bun.write(join(TMP_DIR, "file2.ts"), "const b = 2;");
    await commitFeature(TMP_DIR, "product", "feat: second commit");

    const commits = await getRecentCommits(TMP_DIR, 2);

    expect(commits)
.toHaveLength(2);
    expect(commits[0])
.toContain("second commit");
    expect(commits[1])
.toContain("first commit");
  });

  it("returns fewer commits than requested when not enough exist", async () => {
    await initRepo(TMP_DIR);

    const { $ } = await import("bun");
    await $`git -C ${TMP_DIR} config user.email "test@test.com"`.quiet();
    await $`git -C ${TMP_DIR} config user.name "Test User"`.quiet();

    await Bun.write(join(TMP_DIR, "only.ts"), "const x = 0;");
    await commitFeature(TMP_DIR, "user", "feat: only commit");

    const commits = await getRecentCommits(TMP_DIR, 10);

    expect(commits.length)
.toBeLessThanOrEqual(10);
    expect(commits.length)
.toBeGreaterThan(0);
  });
});

describe("rollbackToLastCommit", () => {
  it("removes changes introduced in the last commit", async () => {
    await initRepo(TMP_DIR);

    const { $ } = await import("bun");
    await $`git -C ${TMP_DIR} config user.email "test@test.com"`.quiet();
    await $`git -C ${TMP_DIR} config user.name "Test User"`.quiet();

    // First commit
    await Bun.write(join(TMP_DIR, "base.ts"), "const base = true;");
    await commitFeature(TMP_DIR, "base", "feat: base commit");

    // Second commit with a new file
    const rollbackFile = join(TMP_DIR, "rollback-target.ts");
    await Bun.write(rollbackFile, "const target = true;");
    await commitFeature(TMP_DIR, "target", "feat: commit to rollback");

    // Verify file exists
    expect(await Bun.file(rollbackFile)
.exists())
.toBe(true);

    // Rollback
    await rollbackToLastCommit(TMP_DIR);

    // After rollback the file from the second commit should be gone
    expect(await Bun.file(rollbackFile)
.exists())
.toBe(false);
  });
});
