import { cpSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = mkdtempSync(path.join(os.tmpdir(), "goodz-clean-clone-"));
const ignored = new Set([".git", "node_modules", "dist", ".next", ".turbo"]);

function include(source) {
  const relative = path.relative(root, source);
  if (!relative) return true;
  const parts = relative.split(path.sep);
  if (parts.some((part) => ignored.has(part))) return false;
  const name = path.basename(source);
  if (name === ".env" || name === ".env.local" || name.endsWith(".tsbuildinfo")) return false;
  if (/\.db(?:-shm|-wal)?$/.test(name)) return false;
  return true;
}

function run(args) {
  const result = spawnSync("pnpm", args, { cwd: target, stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`pnpm ${args.join(" ")} failed in clean clone`);
}

try {
  cpSync(root, target, { recursive: true, filter: include });
  run(["install", "--offline", "--frozen-lockfile"]);
  run(["check:cli"]);
  run(["check:template"]);
  run(["check:portability"]);
  console.log("clean clone install, CLI, template, and portability checks ok");
} finally {
  rmSync(target, { recursive: true, force: true });
}
