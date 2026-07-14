import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createGitHubPullRequest, parseGitHubRemote, publishGitChanges } from "./git.js";

function git(root: string, args: string[]) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

async function repository() {
  const root = await mkdtemp(path.join(os.tmpdir(), "goodz-git-"));
  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.name", "Goodz Test"]);
  git(root, ["config", "user.email", "goodz@example.com"]);
  await writeFile(path.join(root, "README.md"), "# Test\n");
  git(root, ["add", "README.md"]);
  git(root, ["commit", "-m", "chore: initialize"]);
  return root;
}

test("parses HTTPS and SSH GitHub remotes", () => {
  assert.deepEqual(parseGitHubRemote("https://github.com/acme/product.git"), { owner: "acme", repository: "product" });
  assert.deepEqual(parseGitHubRemote("git@github.com:acme/product.git"), { owner: "acme", repository: "product" });
  assert.throws(() => parseGitHubRemote("https://example.com/acme/product.git"), /GitHub repository/);
});

test("creates a GitHub pull request through the connector contract", async () => {
  let requestBody = "";
  const server = createServer((request, response) => {
    request.on("data", (chunk) => { requestBody += chunk.toString(); });
    request.on("end", () => {
      response.writeHead(201, { "content-type": "application/json" });
      response.end(JSON.stringify({ html_url: "https://github.com/acme/product/pull/1" }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server address is unavailable");
    const url = await createGitHubPullRequest({
      root: ".",
      projectId: "PRJ-1",
      projectName: "Test",
      paths: [],
      branch: "goodz/prj-1",
      message: "docs: 승인 산출물 반영",
      remote: "origin",
      base: "main",
      token: "test-token",
    }, "https://github.com/acme/product.git", `http://127.0.0.1:${address.port}`);
    assert.equal(url, "https://github.com/acme/product/pull/1");
    const body = JSON.parse(requestBody) as { head: string; base: string };
    assert.equal(body.head, "goodz/prj-1");
    assert.equal(body.base, "main");
  } finally {
    server.close();
  }
});

test("publishes only approved export paths to a local branch and commit", async () => {
  const root = await repository();
  try {
    await mkdir(path.join(root, "docs/projects/prj-1"), { recursive: true });
    await mkdir(path.join(root, ".goodz/exports"), { recursive: true });
    await writeFile(path.join(root, "docs/projects/prj-1/PRD.md"), "# PRD\n");
    await writeFile(path.join(root, ".goodz/exports/prj-1.json"), "{}\n");
    const result = await publishGitChanges({
      root,
      projectId: "PRJ-1",
      projectName: "Test",
      paths: ["docs/projects/prj-1/PRD.md", ".goodz/exports/prj-1.json"],
      branch: "goodz/prj-1",
      message: "docs: 승인 산출물 반영",
      remote: "origin",
      base: "main",
      noPush: true,
      noPr: true,
    });
    assert.equal(result.branch, "goodz/prj-1");
    assert.equal(result.pushed, false);
    assert.equal(git(root, ["branch", "--show-current"]), "goodz/prj-1");
    assert.equal(git(root, ["log", "-1", "--pretty=%s"]), "docs: 승인 산출물 반영");
    assert.equal(git(root, ["status", "--porcelain"]), "");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects unrelated working tree changes", async () => {
  const root = await repository();
  try {
    await mkdir(path.join(root, "docs/projects/prj-1"), { recursive: true });
    await writeFile(path.join(root, "docs/projects/prj-1/PRD.md"), "# PRD\n");
    await writeFile(path.join(root, "README.md"), "changed\n");
    await assert.rejects(publishGitChanges({
      root,
      projectId: "PRJ-1",
      projectName: "Test",
      paths: ["docs/projects/prj-1/PRD.md"],
      branch: "goodz/prj-1",
      message: "docs: 승인 산출물 반영",
      remote: "origin",
      base: "main",
      noPush: true,
      noPr: true,
    }), /unrelated changes: README.md/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
