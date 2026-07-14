import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = resolve(root, "references/goodz-internal/status.json");
const snapshotsPath = resolve(root, "references/goodz-internal/metrics-snapshots.json");
const checkOnly = process.argv.includes("--check");

function parseTimestamp(value, boundary = "start") {
  if (!value) return null;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(
    isDateOnly
      ? `${value}T${boundary === "start" ? "00:00:00" : "23:59:59"}`
      : value,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function diffHours(start, end, endBoundary = "start") {
  const startDate = parseTimestamp(start, "start");
  const endDate = parseTimestamp(end, endBoundary);
  if (!startDate || !endDate) return null;
  return Math.max(0, (endDate.getTime() - startDate.getTime()) / 3_600_000);
}

function earliestTimestamp(values) {
  return values
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = parseTimestamp(a)?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = parseTimestamp(b)?.getTime() ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })[0];
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundMetric(value) {
  return value === null ? null : Number(value.toFixed(2));
}

function countEvidenceIssues(trace) {
  let count = 0;
  const needsRuntimeEvidence = trace.status === "linked" || trace.status === "released";
  const hasDeploymentEvidence =
    trace.release.status === "linked" ||
    trace.smoke?.status === "passed" ||
    trace.smoke?.status === "not_required";

  if (trace.deliverableIds.length === 0) count += 1;
  if (trace.approvalIds.length === 0) count += 1;
  if (trace.commits.length === 0) count += needsRuntimeEvidence ? 1 : 1;
  if (trace.ciRuns.length === 0) count += needsRuntimeEvidence ? 1 : 1;
  if (trace.issue.status === "pending") count += 1;
  if (trace.pr.status === "pending") count += 1;
  if (!hasDeploymentEvidence) count += 1;
  return count;
}

function getHeadSha() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

function buildSnapshot(status) {
  const changesById = new Map(
    status.planningChanges.map((change) => [change.id, change]),
  );
  const approvalsById = new Map(
    status.approvals.map((approval) => [approval.id, approval]),
  );
  const traceRows = status.traceLinks.map((trace) => {
    const requestedAt =
      trace.changeIds
        .map((id) => changesById.get(id)?.requestedAt)
        .find(Boolean) ??
      trace.approvalIds
        .map((id) => approvalsById.get(id)?.requestedAt)
        .find(Boolean) ??
      status.updatedAt;
    const committedAt = earliestTimestamp(
      trace.commits.map((commit) => commit.committedAt),
    );
    const ciCompletedAt = earliestTimestamp(
      trace.ciRuns
        .filter((run) => run.status === "success")
        .map((run) => run.completedAt ?? run.startedAt ?? run.createdAt),
    );
    const deliveredAt =
      trace.smoke?.checkedAt ??
      trace.release.publishedAt ??
      trace.release.createdAt ??
      "";

    return {
      deliveredAt,
      totalLeadHours: deliveredAt
        ? diffHours(requestedAt, deliveredAt, "end")
        : null,
      hasSuccessfulCi: trace.ciRuns.some((run) => run.status === "success"),
      failedCiRuns: trace.ciRuns.filter((run) => run.status === "failed").length,
      smokeStatus: trace.smoke?.status,
      committedAt,
      ciCompletedAt,
    };
  });
  const evidenceIssues = status.traceLinks.reduce(
    (sum, trace) => sum + countEvidenceIssues(trace),
    0,
  );
  const deliveredRows = traceRows.filter((row) => row.deliveredAt);
  const smokeRuns = traceRows.filter((row) => row.smokeStatus);
  const passedSmokeRuns = smokeRuns.filter((row) => row.smokeStatus === "passed");
  const failedSmokeRuns = smokeRuns.filter((row) => row.smokeStatus === "failed");
  const totalCiRuns = status.traceLinks.reduce(
    (sum, trace) => sum + trace.ciRuns.length,
    0,
  );
  const successfulCiRuns = traceRows.filter((row) => row.hasSuccessfulCi).length;
  const failedCiRuns = traceRows.reduce((sum, row) => sum + row.failedCiRuns, 0);
  const deliveryAttempts = Math.max(deliveredRows.length, 1);
  const capturedAt = new Date().toISOString();

  return {
    id: `MS-${capturedAt.replace(/[-:.]/g, "").slice(0, 15)}Z`,
    capturedAt,
    source: {
      systemVersion: status.systemVersion,
      statusUpdatedAt: status.updatedAt,
      headSha: getHeadSha(),
    },
    totals: {
      traceCount: status.traceLinks.length,
      linkedTraceCount: status.traceLinks.filter((trace) =>
        ["linked", "released"].includes(trace.status),
      ).length,
      releasedTraceCount: status.traceLinks.filter((trace) => trace.status === "released").length,
      evidenceIssues,
    },
    delivery: {
      deploymentFrequency: deliveredRows.length,
      leadTimeHours: roundMetric(
        average(
          deliveredRows
            .map((row) => row.totalLeadHours)
            .filter((value) => value !== null),
        ),
      ),
      ciSuccessRate:
        totalCiRuns === 0
          ? null
          : roundMetric((successfulCiRuns / totalCiRuns) * 100),
      changeFailureRate: roundMetric(
        ((failedCiRuns + failedSmokeRuns.length) / deliveryAttempts) * 100,
      ),
      smokePassRate:
        smokeRuns.length === 0
          ? null
          : roundMetric((passedSmokeRuns.length / smokeRuns.length) * 100),
      traceCoverage: roundMetric(
        (status.traceLinks.filter((trace) => ["linked", "released"].includes(trace.status)).length /
          Math.max(status.traceLinks.length, 1)) *
          100,
      ),
      evidenceCompleteness: roundMetric(
        ((status.traceLinks.length * 7 - evidenceIssues) /
          Math.max(status.traceLinks.length * 7, 1)) *
          100,
      ),
      mttrHours: null,
    },
    notes: "Generated from references/goodz-internal/status.json",
  };
}

const status = JSON.parse(readFileSync(statusPath, "utf8"));
const snapshots = existsSync(snapshotsPath)
  ? JSON.parse(readFileSync(snapshotsPath, "utf8"))
  : { version: 1, updatedAt: status.updatedAt, snapshots: [] };

if (!Array.isArray(snapshots.snapshots)) {
  throw new Error("metrics-snapshots.json snapshots must be an array");
}

const snapshot = buildSnapshot(status);

if (checkOnly) {
  const latest = snapshots.snapshots.at(-1);
  console.log(
    latest
      ? `metrics snapshot ok: latest ${latest.id} (${latest.capturedAt})`
      : "metrics snapshot ok: no snapshots yet",
  );
  process.exit(0);
}

const next = {
  version: 1,
  updatedAt: snapshot.capturedAt,
  snapshots: [...snapshots.snapshots, snapshot],
};

writeFileSync(snapshotsPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`metrics snapshot saved: ${snapshot.id}`);
