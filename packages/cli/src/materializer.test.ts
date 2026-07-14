import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { ProcessProjectExportBundle } from "@goodz/process";
import { MaterializationConflictError, materializeProjectBundle, verifyMaterializedExports } from "./materializer.js";

function bundle(content = "# PRD\n"): ProcessProjectExportBundle {
  return {
    schemaVersion: 1,
    projectId: "PRJ-TEST",
    projectName: "Test",
    generatedAt: "2026-07-14T00:00:00.000Z",
    files: [
      { path: "docs/projects/prj-test/PRD.md", mediaType: "text/markdown", content },
      { path: "docs/projects/prj-test/DESIGN_PACK.md", mediaType: "text/markdown", content: "# Design\n" },
      { path: "docs/projects/prj-test/CLAUDE_DESIGN_HANDOFF.md", mediaType: "text/markdown", content: "# Handoff\n" },
    ],
  };
}

test("materializes, updates, and verifies an export bundle", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-cli-"));
  try {
    const first = await materializeProjectBundle(bundle(), { root });
    assert.equal(first.written.length, 3);
    const second = await materializeProjectBundle(bundle(), { root });
    assert.equal(second.skipped.length, 3);
    const updated = await materializeProjectBundle(bundle("# Updated PRD\n"), { root });
    assert.deepEqual(updated.written, ["docs/projects/prj-test/PRD.md"]);
    assert.equal(await readFile(path.join(root, "docs/projects/prj-test/PRD.md"), "utf8"), "# Updated PRD\n");
    assert.deepEqual(await verifyMaterializedExports(root), { manifests: 1, files: 3 });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("protects local edits unless force is explicit", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-cli-"));
  try {
    await materializeProjectBundle(bundle(), { root });
    const prdPath = path.join(root, "docs/projects/prj-test/PRD.md");
    await writeFile(prdPath, "# Local edit\n", "utf8");
    await assert.rejects(
      materializeProjectBundle(bundle("# Server update\n"), { root }),
      (error) => error instanceof MaterializationConflictError && error.paths.includes("docs/projects/prj-test/PRD.md"),
    );
    await materializeProjectBundle(bundle("# Forced update\n"), { root, force: true });
    assert.equal(await readFile(prdPath, "utf8"), "# Forced update\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects traversal and keeps dry-run side effect free", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-cli-"));
  try {
    const unsafe = bundle();
    unsafe.files[0] = { ...unsafe.files[0]!, path: "docs/projects/../../outside.md" };
    await assert.rejects(materializeProjectBundle(unsafe, { root }), /Unsafe export path/);
    const preview = await materializeProjectBundle(bundle(), { root, dryRun: true });
    assert.equal(preview.written.length, 3);
    await assert.rejects(readFile(path.join(root, "docs/projects/prj-test/PRD.md")), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects a symlink that escapes the workspace", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-cli-"));
  const outside = await mkdtemp(path.join(os.tmpdir(), "goodz-cli-outside-"));
  try {
    await mkdir(path.join(root, "docs"), { recursive: true });
    await symlink(outside, path.join(root, "docs/projects"));
    await assert.rejects(materializeProjectBundle(bundle(), { root }), /Symbolic links are not allowed/);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
