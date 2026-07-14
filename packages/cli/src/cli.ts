#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { GoodzClient } from "./client.js";
import { initializeGoodz, verifyGoodzWorkspace } from "./config.js";
import { materializeProjectBundle } from "./materializer.js";

const HELP = `Goodz CLI v0.1

Usage:
  goodz init --name <project> [--root <path>] [--force]
  goodz project create --name <name> --summary <text> --owner <owner> [--template <id>] [--api <url>]
  goodz export --project <id> [--root <path>] [--api <url>] [--dry-run] [--force]
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
