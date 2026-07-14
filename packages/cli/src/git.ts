import { spawnSync } from "node:child_process";
import path from "node:path";

export interface GitPublishOptions {
  root: string;
  projectId: string;
  projectName: string;
  paths: string[];
  branch: string;
  message: string;
  remote: string;
  base: string;
  noPush?: boolean;
  noPr?: boolean;
  token?: string;
}

export interface GitPublishResult {
  branch: string;
  commit: string;
  pushed: boolean;
  pullRequestUrl?: string;
}

function runGit(root: string, args: string[]) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `git ${args[0]} failed`).trim());
  }
  return result.stdout;
}

function git(root: string, args: string[]) {
  return runGit(root, args).trim();
}

function normalizePath(root: string, value: string) {
  const absoluteRoot = path.resolve(root);
  const absolute = path.resolve(absoluteRoot, value);
  const relative = path.relative(absoluteRoot, absolute).replaceAll("\\", "/");
  if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) {
    throw new Error(`Git publish path escaped the repository: ${value}`);
  }
  return relative;
}

function changedPaths(root: string) {
  const output = runGit(root, ["status", "--porcelain=v1", "--untracked-files=all", "-z"]);
  if (!output) return [];
  const entries = output.split("\0").filter(Boolean);
  const paths: string[] = [];
  for (const entry of entries) {
    const status = entry.slice(0, 2);
    if (status.includes("R") || status.includes("C")) throw new Error("Renamed or copied files are not supported by Goodz Git publish");
    paths.push(entry.slice(3));
  }
  return paths;
}

export function assertGitWorkspaceClean(root: string) {
  git(root, ["rev-parse", "--is-inside-work-tree"]);
  const changes = changedPaths(root);
  if (changes.length > 0) throw new Error(`Git workspace must be clean before export: ${changes.join(", ")}`);
}

export function parseGitHubRemote(value: string) {
  const match = value.match(/^(?:https:\/\/github\.com\/|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match?.[1] || !match[2]) throw new Error("Git remote must point to a GitHub repository");
  return { owner: match[1], repository: match[2] };
}

export async function createGitHubPullRequest(
  options: GitPublishOptions,
  remoteUrl: string,
  apiUrl = "https://api.github.com",
) {
  if (!options.token) throw new Error("GOODZ_GITHUB_TOKEN or GITHUB_TOKEN is required to create a pull request");
  const repo = parseGitHubRemote(remoteUrl);
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repository)}/pulls`, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${options.token}`,
      "content-type": "application/json",
      "user-agent": "goodz-cli",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({
      title: options.message,
      head: options.branch,
      base: options.base,
      body: `Goodz 프로젝트 ${options.projectName} (${options.projectId})의 승인 산출물을 반영합니다.`,
    }),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) as { html_url?: string; message?: string } : {};
  if (!response.ok || !data.html_url) throw new Error(data.message || `GitHub pull request returned HTTP ${response.status}`);
  return data.html_url;
}

export async function publishGitChanges(options: GitPublishOptions): Promise<GitPublishResult> {
  const root = path.resolve(options.root);
  git(root, ["rev-parse", "--is-inside-work-tree"]);
  git(root, ["check-ref-format", "--branch", options.branch]);
  if (!/^[A-Za-z0-9._-]+$/.test(options.remote)) throw new Error("Invalid Git remote name");
  if (options.noPush && !options.noPr) throw new Error("Pull request creation requires push");
  const remoteUrl = options.noPush ? "" : git(root, ["remote", "get-url", options.remote]);
  if (!options.noPr) {
    if (!options.token) throw new Error("GOODZ_GITHUB_TOKEN or GITHUB_TOKEN is required to create a pull request");
    parseGitHubRemote(remoteUrl);
  }
  const allowed = new Set(options.paths.map((item) => normalizePath(root, item)));
  const changes = changedPaths(root);
  if (changes.length === 0) throw new Error("No Goodz export changes are available to publish");
  const unexpected = changes.filter((item) => !allowed.has(item));
  if (unexpected.length > 0) throw new Error(`Git publish found unrelated changes: ${unexpected.join(", ")}`);

  git(root, ["switch", "-c", options.branch]);
  git(root, ["add", "--", ...allowed]);
  const staged = git(root, ["diff", "--cached", "--name-only"]);
  if (!staged) throw new Error("No Goodz export changes were staged");
  git(root, ["commit", "-m", options.message]);
  const commit = git(root, ["rev-parse", "HEAD"]);
  if (!options.noPush) git(root, ["push", "-u", options.remote, options.branch]);
  const pullRequestUrl = options.noPr ? undefined : await createGitHubPullRequest(options, remoteUrl);
  return {
    branch: options.branch,
    commit,
    pushed: !options.noPush,
    ...(pullRequestUrl ? { pullRequestUrl } : {}),
  };
}
