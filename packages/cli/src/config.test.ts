import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { adoptGoodz, initializeGoodz, migrateGoodzConfig, verifyGoodzWorkspace } from "./config.js";

test("initializes and verifies Goodz metadata in an existing repository", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-init-"));
  try {
    const initialized = await initializeGoodz(root, "Acme Portal");
    assert.equal(initialized.configPath, path.join(root, "goodz.config.json"));
    assert.equal(initialized.workspacePath, path.join(root, ".goodz/workspace.json"));
    const config = JSON.parse(await readFile(initialized.configPath, "utf8")) as {
      platform: { sourceOfTruth: string };
      references: Array<{ id: string }>;
    };
    assert.equal(config.platform.sourceOfTruth, "operations-db");
    assert.deepEqual(config.references, []);
    const workspace = JSON.parse(await readFile(initialized.workspacePath, "utf8")) as {
      name: string;
      storage: { path: string };
    };
    assert.equal(workspace.name, "Acme Portal");
    assert.equal(workspace.storage.path, ".goodz/data/goodz.db");
    assert.match(await readFile(path.join(root, "docs/00-process/README.md"), "utf8"), /Acme Portal Process Workspace/);
    assert.match(await readFile(path.join(root, "docs/projects/README.md"), "utf8"), /Project Deliverables/);
    assert.match(await readFile(path.join(root, "docs/00-process/USER_MANUAL.md"), "utf8"), /Acme Portal Goodz/);
    assert.match(await readFile(path.join(root, "docs/00-process/WORKFLOW.md"), "utf8"), /P0 기획/);
    const verified = await verifyGoodzWorkspace(root);
    assert.equal(verified.configVersion, 2);
    assert.equal(verified.references, 0);
    assert.equal(verified.exports.manifests, 0);
    assert.equal(verified.warnings.length, 1);
    await assert.rejects(initializeGoodz(root, "Acme Portal"), /already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("migrates config v1 to v2 with dry-run and idempotency", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-config-migrate-"));
  try {
    await initializeGoodz(root, "Legacy");
    const configPath = path.join(root, "goodz.config.json");
    const current = JSON.parse(await readFile(configPath, "utf8")) as Record<string, unknown>;
    const { delivery: _delivery, ...legacy } = current;
    await writeFile(configPath, `${JSON.stringify({ ...legacy, version: 1 }, null, 2)}\n`);

    const planned = await migrateGoodzConfig(root, true);
    assert.equal(planned.changed, true);
    assert.equal((JSON.parse(await readFile(configPath, "utf8")) as { version: number }).version, 1);

    const migrated = await migrateGoodzConfig(root);
    assert.equal(migrated.from, 1);
    const next = JSON.parse(await readFile(configPath, "utf8")) as {
      version: number;
      delivery: { git: { branchPrefix: string } };
    };
    assert.equal(next.version, 2);
    assert.equal(next.delivery.git.branchPrefix, "goodz/");
    assert.equal((await migrateGoodzConfig(root)).changed, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("plans and applies adoption without changing an existing repository by default", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-adopt-"));
  try {
    await mkdir(path.join(root, "apps/portal"), { recursive: true });
    await mkdir(path.join(root, "packages/types"), { recursive: true });
    await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "acme-workspace", packageManager: "pnpm@10.0.0" }));
    await writeFile(path.join(root, "apps/portal/package.json"), JSON.stringify({ name: "@acme/portal" }));
    await writeFile(path.join(root, "packages/types/package.json"), JSON.stringify({ name: "@acme/types" }));

    const plan = await adoptGoodz(root);
    assert.equal(plan.applied, false);
    assert.equal(plan.projectName, "Acme Workspace");
    assert.equal(plan.packageManager, "pnpm");
    assert.deepEqual(plan.references[0]?.apps, ["apps/portal"]);
    assert.equal(plan.references[0]?.typePackage, "@acme/types");
    await assert.rejects(readFile(path.join(root, "goodz.config.json")), /ENOENT/);

    const applied = await adoptGoodz(root, undefined, true);
    assert.equal(applied.applied, true);
    const config = JSON.parse(await readFile(path.join(root, "goodz.config.json"), "utf8")) as {
      references: Array<{ typePackage: string }>;
    };
    assert.equal(config.references[0]?.typePackage, "@acme/types");
    await assert.rejects(adoptGoodz(root, undefined, true), /already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("adoption detects separately nested reference applications", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-adopt-reference-"));
  try {
    await mkdir(path.join(root, "references/content/apps/api"), { recursive: true });
    await mkdir(path.join(root, "references/content/packages/types"), { recursive: true });
    await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "platform" }));
    await writeFile(path.join(root, "references/content/apps/api/package.json"), JSON.stringify({ name: "@content/api" }));
    await writeFile(path.join(root, "references/content/packages/types/package.json"), JSON.stringify({ name: "@content/types" }));
    const plan = await adoptGoodz(root);
    assert.equal(plan.references[0]?.id, "content");
    assert.equal(plan.references[0]?.typePackage, "@content/types");
    assert.deepEqual(plan.references[0]?.apps, ["references/content/apps/api"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
