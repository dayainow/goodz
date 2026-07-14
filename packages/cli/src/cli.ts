#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { GoodzClient } from "./client.js";
import { adoptGoodz, initializeGoodz, migrateGoodzConfig, verifyGoodzWorkspace } from "./config.js";
import { assertGitWorkspaceClean, publishGitChanges } from "./git.js";
import { materializeProjectBundle } from "./materializer.js";

const HELP = `Goodz CLI v1.0

Usage:
  goodz init --name <project> [--root <path>] [--force]
  goodz adopt [--name <project>] [--root <path>] [--apply] [--force]
  goodz config migrate [--root <path>] [--dry-run]
  goodz project create --name <name> --summary <text> --owner <owner> [--template <id>] [--api <url>]
  goodz template migrate --from <template-id> [--name <name>] [--summary <text>] [--api <url>]
  goodz export --project <id> [--root <path>] [--api <url>] [--dry-run] [--force]
  goodz git publish --project <id> [--root <path>] [--api <url>] [--branch <name>] [--base <name>] [--remote <name>] [--dry-run] [--no-push --no-pr]
  goodz verify [--root <path>] [--full]

Environment:
  GOODZ_API_URL, GOODZ_BASIC_AUTH_USER, GOODZ_BASIC_AUTH_PASSWORD
`;

function option(args: string[], name: string) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

function required(args: string[], name: string) {
  const value = option(args, name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function has(args: string[], name: string) {
  return args.includes(name);
}

function workspaceRoot(args: string[]) {
  const invocationRoot = process.env.INIT_CWD ?? process.cwd();
  return path.resolve(invocationRoot, option(args, "--root") ?? ".");
}

function client(args: string[]) {
  return new GoodzClient({
    apiUrl: option(args, "--api") ?? process.env.GOODZ_API_URL ?? "http://localhost:4000",
    user: process.env.GOODZ_BASIC_AUTH_USER,
    password: process.env.GOODZ_BASIC_AUTH_PASSWORD,
  });
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const args = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;
  const command = args[0];
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }
  if (command === "init") {
    const initialized = await initializeGoodz(workspaceRoot(args), required(args, "--name"), has(args, "--force"));
    console.log(`Goodz initialized: ${initialized.configPath}`);
    return;
  }
  if (command === "adopt") {
    const plan = await adoptGoodz(
      workspaceRoot(args),
      option(args, "--name"),
      has(args, "--apply"),
      has(args, "--force"),
    );
    console.log(`${plan.applied ? "Adopted" : "Adoption plan"}: ${plan.projectName}`);
    console.log(`Package manager: ${plan.packageManager}`);
    for (const reference of plan.references) {
      console.log(`Reference: ${reference.name} (${reference.apps.join(", ")})`);
    }
    plan.warnings.forEach((warning) => console.warn(`warning: ${warning}`));
    if (!plan.applied) console.log("No files changed. Re-run with --apply to write goodz.config.json.");
    else console.log(`Config: ${plan.configPath}`);
    return;
  }
  if (command === "config" && args[1] === "migrate") {
    const result = await migrateGoodzConfig(workspaceRoot(args), has(args, "--dry-run"));
    if (!result.changed) console.log(`Goodz config is already v${result.to}: ${result.configPath}`);
    else console.log(`${result.dryRun ? "Planned" : "Migrated"}: config v${result.from} → v${result.to}`);
    return;
  }
  if (command === "project" && args[1] === "create") {
    const api = client(args);
    const templateId = option(args, "--template") ?? (await api.workspace()).templates[0]?.id;
    if (!templateId) throw new Error("No Process Template is available");
    const created = await api.createProject({
      name: required(args, "--name"),
      summary: required(args, "--summary"),
      owner: required(args, "--owner"),
      templateId,
    });
    console.log(`Project created: ${created.project.id}`);
    console.log(`Run started: ${created.run.id}`);
    return;
  }
  if (command === "template" && args[1] === "migrate") {
    const migrated = await client(args).migrateTemplate(required(args, "--from"), {
      ...(option(args, "--name") ? { name: option(args, "--name") } : {}),
      ...(option(args, "--summary") ? { summary: option(args, "--summary") } : {}),
    });
    console.log(`Template migrated: ${migrated.source.id} → ${migrated.target.id}`);
    console.log(`Version: ${migrated.source.version} → ${migrated.target.version}`);
    return;
  }
  if (command === "export") {
    const projectId = required(args, "--project");
    const root = workspaceRoot(args);
    const bundle = await client(args).exportProject(projectId);
    const result = await materializeProjectBundle(bundle, {
      root,
      dryRun: has(args, "--dry-run"),
      force: has(args, "--force"),
    });
    console.log(`${result.dryRun ? "Planned" : "Materialized"}: ${result.written.length} file(s), ${result.skipped.length} unchanged`);
    console.log(`Manifest: ${result.manifestPath}`);
    return;
  }
  if (command === "git" && args[1] === "publish") {
    const projectId = required(args, "--project");
    const root = workspaceRoot(args);
    assertGitWorkspaceClean(root);
    const bundle = await client(args).exportProject(projectId);
    const dryRun = has(args, "--dry-run");
    const materialized = await materializeProjectBundle(bundle, { root, dryRun });
    const branch = option(args, "--branch") ?? `goodz/${projectId.toLowerCase()}`;
    const message = option(args, "--message") ?? `docs: ${bundle.projectName} 승인 산출물 반영`;
    if (dryRun) {
      console.log(`Git publish plan: ${branch}`);
      console.log(`Files: ${materialized.written.length}, message: ${message}`);
      console.log("No files, branches, commits, pushes, or pull requests were changed.");
      return;
    }
    const result = await publishGitChanges({
      root,
      projectId,
      projectName: bundle.projectName,
      paths: [...bundle.files.map((file) => file.path), materialized.manifestPath],
      branch,
      message,
      remote: option(args, "--remote") ?? "origin",
      base: option(args, "--base") ?? "main",
      noPush: has(args, "--no-push"),
      noPr: has(args, "--no-pr"),
      token: process.env.GOODZ_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN,
    });
    console.log(`Git commit: ${result.commit}`);
    console.log(`Branch: ${result.branch}${result.pushed ? " (pushed)" : " (local)"}`);
    if (result.pullRequestUrl) console.log(`Pull request: ${result.pullRequestUrl}`);
    return;
  }
  if (command === "verify") {
    const root = workspaceRoot(args);
    const result = await verifyGoodzWorkspace(root);
    console.log(`Goodz config v${result.configVersion}: ${result.references} Reference(s)`);
    console.log(`Materialized exports: ${result.exports.manifests} manifest(s), ${result.exports.files} file(s)`);
    result.warnings.forEach((warning) => console.warn(`warning: ${warning}`));
    if (has(args, "--full")) {
      const verification = spawnSync("pnpm", ["verify"], { cwd: root, stdio: "inherit" });
      if (verification.status !== 0) throw new Error("pnpm verify failed");
    }
    return;
  }
  throw new Error(`Unknown command: ${args.join(" ")}\n\n${HELP}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
