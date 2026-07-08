#!/usr/bin/env node
/**
 * 워크스페이스 패키지별 미선언 의존성(phantom dependency) 검사.
 * pnpm isolated linker와 함께 CI에서 실행합니다.
 */
import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const ignores =
  "@goodz/*,@types/*,eslint*,typescript,tailwindcss,postcss,autoprefixer,vitest,@testing-library/*,jsdom,msw,@vitejs/*,tsx,ga-analytics-harness,next,react,react-dom";

const workspaceRoots = ["apps", "packages"];
const packages = [];

for (const dir of workspaceRoots) {
  const base = join(root, dir);
  for (const name of readdirSync(base)) {
    const pkgDir = join(base, name);
    if (statSync(pkgDir).isDirectory() && !name.startsWith(".")) {
      packages.push(pkgDir);
    }
  }
}

let failed = false;

for (const pkgDir of packages) {
  const label = pkgDir.replace(`${root}/`, "");
  process.stdout.write(`check:deps ${label}… `);
  try {
    execSync(`pnpm exec depcheck "${pkgDir}" --ignores="${ignores}"`, {
      cwd: root,
      stdio: "pipe",
    });
    process.stdout.write("ok\n");
  } catch {
    process.stdout.write("FAIL\n");
    failed = true;
    try {
      execSync(`pnpm exec depcheck "${pkgDir}" --ignores="${ignores}"`, {
        cwd: root,
        stdio: "inherit",
      });
    } catch {
      // depcheck exits 1 on issues; output already printed
    }
  }
}

if (failed) {
  process.exit(1);
}
