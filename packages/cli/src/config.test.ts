import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { initializeGoodz, verifyGoodzWorkspace } from "./config.js";

test("initializes and verifies Goodz metadata in an existing repository", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-init-"));
  try {
    const initialized = await initializeGoodz(root, "Acme Portal");
    assert.equal(initialized.configPath, path.join(root, "goodz.config.json"));
    const config = JSON.parse(await readFile(initialized.configPath, "utf8")) as {
      references: Array<{ id: string }>;
    };
    assert.equal(config.references[0]?.id, "acme-portal-reference");
    const verified = await verifyGoodzWorkspace(root);
    assert.equal(verified.configVersion, 1);
    assert.equal(verified.references, 1);
    assert.equal(verified.exports.manifests, 0);
    assert.equal(verified.warnings.length, 1);
    await assert.rejects(initializeGoodz(root, "Acme Portal"), /already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
