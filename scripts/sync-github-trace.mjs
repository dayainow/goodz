import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = resolve(root, "docs/00-process/status.json");
const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");
const repo = process.env.GOODZ_GITHUB_REPO ?? "dayainow/goodz";
const releaseUrl = process.env.GOODZ_RELEASE_URL;

function ghApi(path, extraArgs = []) {
  const output = execFileSync("gh", ["api", ...extraArgs, path], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return output.trim() ? JSON.parse(output) : null;
}

function shortSha(sha) {
  return sha.slice(0, 7);
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapRunStatus(run) {
  if (run.status !== "completed") return "running";
  if (run.conclusion === "success") return "success";
  if (run.conclusion === "failure" || run.conclusion === "cancelled") return "failed";
  return "pending";
}

function getRunForCommit(sha) {
  const data = ghApi(`/repos/${repo}/actions/runs?head_sha=${sha}&per_page=10`);
  const runs = data?.workflow_runs ?? [];
  const ciRun = runs.find((run) => run.name === "CI") ?? runs[0];
  if (!ciRun) return null;

  return {
    id: String(ciRun.id),
    status: mapRunStatus(ciRun),
    url: ciRun.html_url,
    createdAt: ciRun.created_at,
    startedAt: ciRun.run_started_at,
    completedAt: ciRun.status === "completed" ? ciRun.updated_at : undefined,
  };
}

function getCommitForSha(sha) {
  try {
    return ghApi(`/repos/${repo}/commits/${sha}`);
  } catch {
    return null;
  }
}

function getPullsForCommit(sha) {
  try {
    return ghApi(`/repos/${repo}/commits/${sha}/pulls`, [
      "-H",
      "Accept: application/vnd.github+json",
    ]) ?? [];
  } catch {
    return [];
  }
}

function extractIssueNumbers(text) {
  const matches = text.matchAll(
    /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)|#(\d+)/gi,
  );
  return Array.from(matches, (match) => match[1] ?? match[2]).filter(Boolean);
}

function getIssueFromPull(pull) {
  const numbers = extractIssueNumbers(`${pull.title ?? ""}\n${pull.body ?? ""}`);
  const issueNumber = numbers.find((number) => String(number) !== String(pull.number));
  if (!issueNumber) return null;

  try {
    const issue = ghApi(`/repos/${repo}/issues/${issueNumber}`);
    if (issue?.pull_request) return null;
    return issue;
  } catch {
    return null;
  }
}

function syncRelease(trace) {
  if (trace.status !== "released") return null;

  if (releaseUrl) {
    trace.release = {
      label: trace.release?.label ?? "Release",
      status: "linked",
      url: releaseUrl,
    };
    return "env release url";
  }

  try {
    const latest = ghApi(`/repos/${repo}/releases/latest`);
    if (latest?.html_url && trace.release?.status !== "linked") {
      trace.release = {
        label: latest.tag_name ? `Release ${latest.tag_name}` : "Release",
        status: "linked",
        url: latest.html_url,
        createdAt: latest.created_at,
        publishedAt: latest.published_at,
      };
      return latest.tag_name ?? "latest";
    }
  } catch {
    return null;
  }

  return null;
}

const before = readFileSync(statusPath, "utf8");
const status = JSON.parse(before);
const beforeNormalized = JSON.stringify(status);
const summary = [];

for (const trace of status.traceLinks) {
  const commits = trace.commits ?? [];
  if (!commits.length) {
    summary.push(`${trace.id}: no commits to sync`);
    continue;
  }

  const ciRuns = [...(trace.ciRuns ?? [])];
  let linkedPr = null;
  let linkedIssue = null;

  for (const commit of commits) {
    const commitDetails = getCommitForSha(commit.sha);
    if (commitDetails?.commit?.author?.date) {
      commit.committedAt = commitDetails.commit.author.date;
    }
    if (commitDetails?.html_url) {
      commit.url = commitDetails.html_url;
    }
    if (commitDetails?.commit?.message && !commit.message) {
      commit.message = commitDetails.commit.message.split("\n")[0];
    }

    const run = getRunForCommit(commitDetails?.sha ?? commit.sha);
    if (run) ciRuns.unshift(run);

    const pulls = getPullsForCommit(commit.sha);
    const pull = pulls[0];
    if (pull && !linkedPr) linkedPr = pull;
    if (pull && !linkedIssue) linkedIssue = getIssueFromPull(pull);
  }

  trace.ciRuns = uniqueBy(ciRuns, (run) => run.id);

  if (linkedPr?.html_url) {
    trace.pr = {
      label: `PR #${linkedPr.number}`,
      status: "linked",
      url: linkedPr.html_url,
      createdAt: linkedPr.created_at,
      updatedAt: linkedPr.updated_at,
      closedAt: linkedPr.closed_at ?? undefined,
      mergedAt: linkedPr.merged_at ?? undefined,
    };
  }

  if (linkedIssue?.html_url) {
    trace.issue = {
      label: `Issue #${linkedIssue.number}`,
      status: "linked",
      url: linkedIssue.html_url,
      createdAt: linkedIssue.created_at,
      updatedAt: linkedIssue.updated_at,
      closedAt: linkedIssue.closed_at ?? undefined,
    };
  }

  const release = syncRelease(trace);
  summary.push(
    `${trace.id}: commits ${commits.map((commit) => shortSha(commit.sha)).join(", ")} · CI ${trace.ciRuns.length}${linkedPr ? ` · PR #${linkedPr.number}` : ""}${linkedIssue ? ` · Issue #${linkedIssue.number}` : ""}${release ? ` · Release ${release}` : ""}`,
  );
}

const after = `${JSON.stringify(status, null, 2)}\n`;
const changed = beforeNormalized !== JSON.stringify(status);

if (changed && !checkOnly) {
  writeFileSync(statusPath, after);
}

console.log(summary.join("\n"));
console.log(
  !changed
    ? "github trace sync: no changes"
    : checkOnly
      ? "github trace sync: changes available (--check did not write)"
      : "github trace sync: status.json updated",
);
