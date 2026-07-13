import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ProcessApp,
  ProcessApproval,
  ProcessCheckItem,
  ProcessDesignReference,
  ProcessDeliverable,
  ProcessDeliverableType,
  ProcessDocumentResponse,
  ProcessIntake,
  ProcessItemStatus,
  ProcessMetricSnapshot,
  ProcessPhase,
  ProcessPlanningChange,
  ProcessPlanningChangeStatus,
  ProcessStatus,
  ProcessTraceLink,
  ProcessTraceReferenceStatus,
  ProcessTraceStatus,
  ProcessWireframe,
  ProcessStoryboard,
} from "@goodz/types";
import {
  fetchProcessDocument,
  fetchProcessMetricSnapshots,
  fetchProcessStatus,
} from "./api/process";
import { PhasePanel } from "./components/PhasePanel";
import { ProgressBar, StatusBadge } from "./components/StatusBadge";

type SectionId =
  | "overview"
  | "intakes"
  | "changes"
  | "design"
  | "guide"
  | "deliverables"
  | "approvals"
  | "evidence"
  | "metrics"
  | "traceability"
  | "phases"
  | "queue"
  | "features"
  | "apps";

const SECTIONS: Array<{ id: SectionId; label: string; eyebrow: string }> = [
  { id: "overview", label: "개요", eyebrow: "Overview" },
  { id: "intakes", label: "기획", eyebrow: "Intake" },
  { id: "changes", label: "변경", eyebrow: "Change" },
  { id: "design", label: "디자인", eyebrow: "Design" },
  { id: "guide", label: "가이드", eyebrow: "Manual" },
  { id: "deliverables", label: "산출물", eyebrow: "Docs" },
  { id: "approvals", label: "승인", eyebrow: "Approval" },
  { id: "evidence", label: "증거", eyebrow: "Evidence" },
  { id: "metrics", label: "지표", eyebrow: "Metrics" },
  { id: "traceability", label: "추적", eyebrow: "Trace" },
  { id: "phases", label: "Phase Gate", eyebrow: "P0-P4" },
  { id: "queue", label: "작업 큐", eyebrow: "Tasks" },
  { id: "features", label: "기능", eyebrow: "Backlog" },
  { id: "apps", label: "앱", eyebrow: "Services" },
];

const SECTION_COPY: Record<SectionId, string> = {
  overview: "현재 상태와 오늘 볼 신호",
  intakes: "요청과 아이디어 입력",
  changes: "기획 수정과 의사결정",
  design: "레퍼런스와 와이어프레임",
  guide: "사용법과 운영 기준",
  deliverables: "문서 산출물 원문",
  approvals: "DACI 승인 로그",
  evidence: "누락된 운영 증거",
  metrics: "Delivery health 추세",
  traceability: "요청부터 CI까지 연결",
  phases: "P0-P4 Gate",
  queue: "미완료 작업 흐름",
  features: "기능 백로그",
  apps: "로컬 서비스 링크",
};

const MENU_GROUPS: Array<{
  title: string;
  summary: string;
  items: SectionId[];
}> = [
  {
    title: "Start",
    summary: "처음 보는 화면",
    items: ["overview", "guide"],
  },
  {
    title: "Plan",
    summary: "요청과 설계",
    items: ["intakes", "changes", "design", "deliverables"],
  },
  {
    title: "Control",
    summary: "승인·증거·지표",
    items: ["approvals", "evidence", "metrics", "traceability"],
  },
  {
    title: "System",
    summary: "실행 상태",
    items: ["phases", "queue", "features", "apps"],
  },
];

const QUICK_SECTIONS: SectionId[] = ["overview", "design", "guide", "metrics"];

const GUIDE_DOCS = [
  {
    path: "docs/00-process/USER_MANUAL.md",
    title: "서비스 이용 매뉴얼",
    summary: "Goodz Process Dashboard를 실제 운영에서 쓰는 방법",
  },
  {
    path: "docs/00-process/AGENT_GUIDE.md",
    title: "에이전트 가이드",
    summary: "Codex/Cursor/Claude Code 협업 기준",
  },
  {
    path: "docs/00-process/WORKFLOW.md",
    title: "워크플로우",
    summary: "P0 기획부터 P4 배포까지의 진행 흐름",
  },
  {
    path: "docs/00-process/METRICS.md",
    title: "Delivery Metrics",
    summary: "지표와 snapshot trend 운영 기준",
  },
  {
    path: "docs/00-process/CICD.md",
    title: "CI/CD 운영",
    summary: "검증, 증거 연결, 릴리스 운영 기준",
  },
];

const STATUS_ORDER: ProcessItemStatus[] = [
  "blocked",
  "in_progress",
  "pending",
  "done",
];

const STATUS_TITLE: Record<ProcessItemStatus, string> = {
  blocked: "차단",
  in_progress: "진행 중",
  pending: "대기",
  done: "완료",
};

const DELIVERABLE_TYPE_LABEL: Record<ProcessDeliverableType, string> = {
  planning: "기획",
  design: "디자인",
  engineering: "개발",
  qa: "QA",
  release: "릴리스",
  ops: "운영",
  retro: "회고",
};

const PLANNING_CHANGE_LABEL: Record<ProcessPlanningChangeStatus, string> = {
  proposed: "제안",
  approved: "승인",
  applied: "반영",
  rejected: "반려",
};

const PLANNING_CHANGE_CLASS: Record<ProcessPlanningChangeStatus, string> = {
  proposed: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-violet-200 bg-violet-50 text-violet-700",
  applied: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const TRACE_STATUS_LABEL: Record<ProcessTraceStatus, string> = {
  pending: "대기",
  partial: "부분 연결",
  linked: "연결",
  released: "릴리스",
};

const TRACE_STATUS_CLASS: Record<ProcessTraceStatus, string> = {
  pending: "border-zinc-200 bg-zinc-50 text-zinc-600",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  linked: "border-violet-200 bg-violet-50 text-violet-700",
  released: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const TRACE_REFERENCE_LABEL: Record<ProcessTraceReferenceStatus, string> = {
  pending: "대기",
  linked: "연결",
  not_required: "해당 없음",
};

const TRACE_REFERENCE_CLASS: Record<ProcessTraceReferenceStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  linked: "border-emerald-200 bg-emerald-50 text-emerald-700",
  not_required: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

const APPROVAL_TYPE_LABEL: Record<ProcessApproval["type"], string> = {
  phase_gate: "Phase Gate",
  sprint: "Sprint",
  deliverable: "Deliverable",
  change: "Change",
  release: "Release",
};

type EvidenceSeverity = "high" | "medium" | "low";

interface EvidenceIssue {
  traceId: string;
  title: string;
  severity: EvidenceSeverity;
  label: string;
  detail: string;
  nextAction: string;
}

type DeliveryMetricTone = "neutral" | "good" | "watch" | "risk";

interface DeliveryMetricCard {
  label: string;
  value: string;
  unit?: string;
  tone: DeliveryMetricTone;
  summary: string;
}

interface DeliveryTraceRow {
  id: string;
  title: string;
  requestedAt: string;
  committedAt: string;
  ciCompletedAt: string;
  deliveredAt: string;
  requestToCommitHours: number | null;
  commitToCiHours: number | null;
  ciToDeliveryHours: number | null;
  totalLeadHours: number | null;
  ciStatus: string;
  smokeStatus: string;
  evidenceWarnings: number;
}

interface DeliveryMetrics {
  cards: DeliveryMetricCard[];
  traceRows: DeliveryTraceRow[];
  evidenceCompleteness: number;
  smokePassRate: number | null;
  traceCoverage: number;
}

const EVIDENCE_SEVERITY_LABEL: Record<EvidenceSeverity, string> = {
  high: "필수",
  medium: "권장",
  low: "릴리스 전",
};

const EVIDENCE_SEVERITY_CLASS: Record<EvidenceSeverity, string> = {
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-sky-200 bg-sky-50 text-sky-700",
};

const DELIVERY_METRIC_TONE_CLASS: Record<DeliveryMetricTone, string> = {
  neutral: "border-zinc-200 bg-white text-zinc-950",
  good: "border-emerald-200 bg-emerald-50 text-emerald-950",
  watch: "border-amber-200 bg-amber-50 text-amber-950",
  risk: "border-rose-200 bg-rose-50 text-rose-950",
};

function parseTimestamp(value?: string, boundary: "start" | "end" = "start") {
  if (!value) return null;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(
    isDateOnly
      ? `${value}T${boundary === "start" ? "00:00:00" : "23:59:59"}`
      : value,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function diffHours(
  start?: string,
  end?: string,
  endBoundary: "start" | "end" = "start",
) {
  const startDate = parseTimestamp(start, "start");
  const endDate = parseTimestamp(end, endBoundary);
  if (!startDate || !endDate) return null;
  return Math.max(
    0,
    (endDate.getTime() - startDate.getTime()) / 3_600_000,
  );
}

function earliestTimestamp(values: Array<string | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => {
      const aTime = parseTimestamp(a)?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = parseTimestamp(b)?.getTime() ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })[0];
}

function formatDuration(hours: number | null) {
  if (hours === null) return "N/A";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function formatTimestamp(value?: string) {
  if (!value) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return value.replace("T", " ").replace("Z", "").slice(0, 16);
}

function formatPercent(value: number | null) {
  return value === null ? "N/A" : `${Math.round(value)}%`;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildEvidenceIssues(traces: ProcessTraceLink[]): EvidenceIssue[] {
  return traces.flatMap((trace) => {
    const issues: EvidenceIssue[] = [];
    const needsRuntimeEvidence = trace.status === "linked" || trace.status === "released";
    const hasDeploymentEvidence =
      trace.release.status === "linked" ||
      trace.smoke?.status === "passed" ||
      trace.smoke?.status === "not_required";

    if (trace.deliverableIds.length === 0) {
      issues.push({
        traceId: trace.id,
        title: trace.title,
        severity: "high",
        label: "산출물 없음",
        detail: "trace link가 산출물 ID와 연결되지 않았습니다.",
        nextAction: "deliverables에 산출물을 등록하고 deliverableIds에 연결",
      });
    }

    if (trace.approvalIds.length === 0) {
      issues.push({
        traceId: trace.id,
        title: trace.title,
        severity: "high",
        label: "승인 없음",
        detail: "DACI 승인 ID가 연결되지 않았습니다.",
        nextAction: "APPROVALS.md와 approvalIds에 승인 레코드 연결",
      });
    }

    if (trace.commits.length === 0) {
      issues.push({
        traceId: trace.id,
        title: trace.title,
        severity: needsRuntimeEvidence ? "high" : "medium",
        label: "Commit 없음",
        detail: "코드 변경 증거가 아직 연결되지 않았습니다.",
        nextAction: "merge 후 commit SHA를 연결하거나 sync:github-trace 실행",
      });
    }

    if (trace.ciRuns.length === 0) {
      issues.push({
        traceId: trace.id,
        title: trace.title,
        severity: needsRuntimeEvidence ? "high" : "medium",
        label: "CI 없음",
        detail: "GitHub Actions run 증거가 아직 연결되지 않았습니다.",
        nextAction: "CI 완료 후 pnpm sync:github-trace 실행",
      });
    }

    if (trace.issue.status === "pending") {
      issues.push({
        traceId: trace.id,
        title: trace.title,
        severity: "medium",
        label: "Issue 대기",
        detail: "기획 또는 작업 이슈 URL이 연결되지 않았습니다.",
        nextAction: "GitHub Issue를 만들거나 not_required로 명시",
      });
    }

    if (trace.pr.status === "pending") {
      issues.push({
        traceId: trace.id,
        title: trace.title,
        severity: "medium",
        label: "PR 대기",
        detail: "Pull Request URL이 연결되지 않았습니다.",
        nextAction: "PR URL을 연결하거나 직접 반영이면 not_required로 명시",
      });
    }

    if (!hasDeploymentEvidence) {
      issues.push({
        traceId: trace.id,
        title: trace.title,
        severity: trace.status === "released" ? "high" : "low",
        label: "릴리스 증거 대기",
        detail: "Release URL 또는 smoke pass 증거가 아직 없습니다.",
        nextAction: "릴리스 URL을 연결하거나 smoke 결과를 trace.smoke에 기록",
      });
    }

    return issues;
  });
}

function buildDeliveryMetrics(
  status: ProcessStatus,
  evidenceIssues: EvidenceIssue[],
): DeliveryMetrics {
  const changesById = new Map(
    status.planningChanges.map((change) => [change.id, change]),
  );
  const approvalsById = new Map(
    status.approvals.map((approval) => [approval.id, approval]),
  );
  const warningCountByTrace = evidenceIssues.reduce<Record<string, number>>(
    (acc, issue) => {
      acc[issue.traceId] = (acc[issue.traceId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const traceRows = status.traceLinks.map<DeliveryTraceRow>((trace) => {
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
    const successfulCiCompletedAt = earliestTimestamp(
      trace.ciRuns
        .filter((run) => run.status === "success")
        .map((run) => run.completedAt ?? run.startedAt ?? run.createdAt),
    );
    const deliveredAt =
      trace.smoke?.checkedAt ??
      trace.release.publishedAt ??
      trace.release.createdAt ??
      "";
    const hasFailedCi = trace.ciRuns.some((run) => run.status === "failed");
    const ciStatus = hasFailedCi
      ? "failed"
      : trace.ciRuns.some((run) => run.status === "success")
        ? "success"
        : "pending";

    return {
      id: trace.id,
      title: trace.title,
      requestedAt,
      committedAt: committedAt ?? "-",
      ciCompletedAt: successfulCiCompletedAt ?? "-",
      deliveredAt: deliveredAt || "-",
      requestToCommitHours: committedAt
        ? diffHours(requestedAt, committedAt)
        : null,
      commitToCiHours:
        committedAt && successfulCiCompletedAt
          ? diffHours(committedAt, successfulCiCompletedAt)
          : null,
      ciToDeliveryHours:
        successfulCiCompletedAt && deliveredAt
          ? diffHours(successfulCiCompletedAt, deliveredAt, "end")
          : null,
      totalLeadHours: deliveredAt
        ? diffHours(requestedAt, deliveredAt, "end")
        : null,
      ciStatus,
      smokeStatus: trace.smoke?.status ?? "not_recorded",
      evidenceWarnings: warningCountByTrace[trace.id] ?? 0,
    };
  });

  const deliveredRows = traceRows.filter((row) => row.deliveredAt !== "-");
  const leadTimeHours = average(
    deliveredRows
      .map((row) => row.totalLeadHours)
      .filter((value): value is number => value !== null),
  );
  const totalCiRuns = status.traceLinks.reduce(
    (sum, trace) => sum + trace.ciRuns.length,
    0,
  );
  const successfulCiRuns = status.traceLinks.reduce(
    (sum, trace) =>
      sum + trace.ciRuns.filter((run) => run.status === "success").length,
    0,
  );
  const failedCiRuns = status.traceLinks.reduce(
    (sum, trace) =>
      sum + trace.ciRuns.filter((run) => run.status === "failed").length,
    0,
  );
  const smokeRuns = status.traceLinks
    .map((trace) => trace.smoke)
    .filter(Boolean);
  const failedSmokeRuns = smokeRuns.filter((smoke) => smoke?.status === "failed");
  const passedSmokeRuns = smokeRuns.filter((smoke) => smoke?.status === "passed");
  const deliveryAttempts = Math.max(deliveredRows.length, 1);
  const changeFailureRate =
    ((failedCiRuns + failedSmokeRuns.length) / deliveryAttempts) * 100;
  const ciSuccessRate =
    totalCiRuns === 0 ? null : (successfulCiRuns / totalCiRuns) * 100;
  const smokePassRate =
    smokeRuns.length === 0 ? null : (passedSmokeRuns.length / smokeRuns.length) * 100;
  const traceCoverage =
    (status.traceLinks.filter((trace) => ["linked", "released"].includes(trace.status)).length /
      Math.max(status.traceLinks.length, 1)) *
    100;
  const evidenceCompleteness =
    ((status.traceLinks.length * 7 - evidenceIssues.length) /
      Math.max(status.traceLinks.length * 7, 1)) *
    100;

  return {
    traceRows,
    evidenceCompleteness,
    smokePassRate,
    traceCoverage,
    cards: [
      {
        label: "Deployment frequency",
        value: String(deliveredRows.length),
        unit: "ready traces",
        tone: deliveredRows.length > 0 ? "good" : "watch",
        summary: "Release URL 또는 smoke pass가 있는 trace 수",
      },
      {
        label: "Lead time",
        value: formatDuration(leadTimeHours),
        tone: leadTimeHours === null ? "neutral" : leadTimeHours <= 72 ? "good" : "watch",
        summary: "요청에서 smoke/release 증거까지의 시간 단위 평균",
      },
      {
        label: "CI success rate",
        value: formatPercent(ciSuccessRate),
        tone:
          ciSuccessRate === null
            ? "neutral"
            : ciSuccessRate >= 95
              ? "good"
              : "risk",
        summary: "traceLinks에 연결된 GitHub Actions run 성공률",
      },
      {
        label: "Change failure rate",
        value: formatPercent(changeFailureRate),
        tone: changeFailureRate === 0 ? "good" : changeFailureRate <= 15 ? "watch" : "risk",
        summary: "실패 CI 또는 실패 smoke가 배포 후보에서 차지하는 비율",
      },
      {
        label: "MTTR",
        value: failedCiRuns + failedSmokeRuns.length === 0 ? "N/A" : "TBD",
        unit: failedCiRuns + failedSmokeRuns.length === 0 ? undefined : "hours",
        tone: failedCiRuns + failedSmokeRuns.length === 0 ? "neutral" : "watch",
        summary: "실패 후 복구 기록이 생기면 계산",
      },
    ],
  };
}

function buildQueue(phases: ProcessPhase[]) {
  return phases.flatMap((phase) =>
    phase.items.map((item) => ({
      ...item,
      phaseId: phase.id,
      phaseName: phase.name,
    })),
  );
}

function getPrimaryWork(
  items: Array<ProcessCheckItem & { phaseId: string; phaseName: string }>,
) {
  return items.filter((item) => item.status !== "done").slice(0, 6);
}

function Sidebar({
  activeSection,
  onSelect,
  status,
  overallProgress,
  evidenceIssueCount,
}: {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
  status: ProcessStatus;
  overallProgress: number;
  evidenceIssueCount: number;
}) {
  const linkedTraces = status.traceLinks.filter((trace) =>
    ["linked", "released"].includes(trace.status),
  ).length;
  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    System: true,
  });
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <aside className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[340px] lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 lg:block">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
            Goodz System
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-950">
            프로세스 관리
          </h1>
        </div>
        <StatusBadge status={status.sprint.status} />
      </div>

      <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-600">전체 진행률</span>
          <span className="font-bold text-zinc-950">{overallProgress}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={overallProgress} />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {status.systemVersion} · {status.updatedAt}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Trace
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-950">
            {linkedTraces}/{status.traceLinks.length}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Evidence
          </p>
          <p className="mt-1 text-lg font-bold text-amber-950">
            {evidenceIssueCount}
          </p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">
            Sprint
          </p>
          <p className="mt-1 text-lg font-bold text-violet-950">
            {status.sprint.id}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
        <label htmlFor="nav-search" className="sr-only">
          메뉴 검색
        </label>
        <input
          id="nav-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="메뉴 검색"
          className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-brand-violet focus:bg-white focus:ring-2 focus:ring-violet-100"
        />
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Quick jump
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_SECTIONS.map((id) => {
              const section = SECTIONS.find((item) => item.id === id);
              if (!section) return null;
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={[
                    "rounded-lg border px-2 py-2 text-xs font-bold transition",
                    isActive
                      ? "border-brand-violet bg-brand-violet text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-200 hover:bg-violet-50 hover:text-brand-violet",
                  ].join(" ")}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="mt-4 space-y-4 overflow-y-auto pr-1">
        {MENU_GROUPS.map((group) => {
          const visibleItems = group.items.filter((id) => {
            const section = SECTIONS.find((item) => item.id === id);
            if (!section) return false;
            return (
              !normalizedQuery ||
              section.label.toLowerCase().includes(normalizedQuery) ||
              section.eyebrow.toLowerCase().includes(normalizedQuery) ||
              SECTION_COPY[section.id].toLowerCase().includes(normalizedQuery)
            );
          });
          const hasActiveItem = group.items.includes(activeSection);
          const isCollapsed =
            collapsedGroups[group.title] && !hasActiveItem && !normalizedQuery;

          if (normalizedQuery && visibleItems.length === 0) return null;

          return (
            <section
              key={group.title}
              className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm"
            >
            <button
              type="button"
              aria-expanded={!isCollapsed}
              onClick={() =>
                setCollapsedGroups((current) => ({
                  ...current,
                  [group.title]: !current[group.title],
                }))
              }
              className="flex w-full items-end justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {group.title}
                </p>
                <p className="text-[11px] text-zinc-400">{group.summary}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
                {isCollapsed ? "열기" : `${visibleItems.length}/${group.items.length}`}
              </span>
            </button>
            {!isCollapsed && (
              <div className="mt-1 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {visibleItems.map((id) => {
                  const section = SECTIONS.find((item) => item.id === id);
                  if (!section) return null;
                  const isActive = section.id === activeSection;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => onSelect(section.id)}
                      className={[
                        "flex min-h-14 items-center justify-between rounded-lg border px-3 text-left transition",
                        isActive
                          ? "border-brand-violet bg-brand-violet text-white shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-200 hover:bg-violet-50",
                      ].join(" ")}
                    >
                      <span className="min-w-0">
                        <span
                          className={[
                            "block text-[11px] font-semibold uppercase tracking-wider",
                            isActive ? "text-white/70" : "text-zinc-400",
                          ].join(" ")}
                        >
                          {section.eyebrow}
                        </span>
                        <span className="block text-sm font-semibold">
                          {section.label}
                        </span>
                        <span
                          className={[
                            "mt-1 hidden truncate text-xs lg:block",
                            isActive ? "text-white/70" : "text-zinc-400",
                          ].join(" ")}
                        >
                          {SECTION_COPY[section.id]}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-lg leading-none">
                        ›
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            </section>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-zinc-200 pt-4 text-xs text-zinc-500 lg:block">
        <p className="font-semibold text-zinc-600">SSOT</p>
        <p className="mt-1 font-mono">docs/00-process/status.json</p>
      </div>
    </aside>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "violet" | "green" | "amber";
}) {
  const toneClass = {
    neutral: "border-zinc-200 bg-white text-zinc-950",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  }[tone];

  return (
    <div className={["rounded-xl border p-4 shadow-sm", toneClass].join(" ")}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ActionCard({
  eyebrow,
  title,
  summary,
  action,
  tone = "neutral",
  onClick,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  action: string;
  tone?: "neutral" | "violet" | "green" | "amber";
  onClick: () => void;
}) {
  const toneClass = {
    neutral: "border-zinc-200 bg-white",
    violet: "border-violet-200 bg-violet-50",
    green: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
        toneClass,
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-bold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{summary}</p>
      <p className="mt-4 text-sm font-semibold text-brand-violet">
        {action} →
      </p>
    </button>
  );
}

function PhaseSignal({ phase }: { phase: ProcessPhase }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold text-brand-violet">
            {phase.id}
          </p>
          <h3 className="mt-1 font-bold text-zinc-950">{phase.name}</h3>
        </div>
        <StatusBadge status={phase.status} />
      </div>
      <div className="mt-4">
        <ProgressBar value={phase.progress} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {phase.items.filter((item) => item.status === "done").length}/
        {phase.items.length} 항목 완료
      </p>
    </div>
  );
}

function QueueRow({
  item,
}: {
  item: ProcessCheckItem & { phaseId: string; phaseName: string };
}) {
  return (
    <li className="grid gap-3 border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[120px_1fr_140px_110px] md:items-center">
      <div>
        <p className="font-mono text-xs font-semibold text-brand-violet">
          {item.phaseId}
        </p>
        <p className="text-xs text-zinc-500">{item.phaseName}</p>
      </div>
      <p className="font-medium text-zinc-900">{item.label}</p>
      <p className="truncate text-xs text-zinc-500">{item.doc ?? item.url ?? "-"}</p>
      <StatusBadge status={item.status} />
    </li>
  );
}

function OverviewSection({
  status,
  overallProgress,
  queue,
  evidenceIssues,
  deliveryMetrics,
  metricSnapshots,
  onSelect,
}: {
  status: ProcessStatus;
  overallProgress: number;
  queue: Array<ProcessCheckItem & { phaseId: string; phaseName: string }>;
  evidenceIssues: EvidenceIssue[];
  deliveryMetrics: DeliveryMetrics;
  metricSnapshots: ProcessMetricSnapshot[];
  onSelect: (section: SectionId) => void;
}) {
  const pendingWork = getPrimaryWork(queue);
  const donePhases = status.phases.filter((phase) => phase.status === "done");
  const doneFeatures = status.features.filter((item) => item.status === "done");
  const doneDeliverables = status.deliverables.filter(
    (item) => item.status === "done",
  );
  const approvedCount = status.approvals.filter(
    (item) => item.status === "approved",
  ).length;
  const appliedChanges = status.planningChanges.filter(
    (item) => item.status === "applied",
  ).length;
  const linkedTraces = status.traceLinks.filter((item) =>
    ["linked", "released"].includes(item.status),
  ).length;
  const latestSnapshot = metricSnapshots.at(-1);
  const leadMetric = deliveryMetrics.cards.find(
    (metric) => metric.label === "Lead time",
  );
  const ciMetric = deliveryMetrics.cards.find(
    (metric) => metric.label === "CI success rate",
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="p-6">
            <p className="text-sm font-semibold text-brand-violet">
              현재 Sprint · {status.sprint.id}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
              {status.sprint.name}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              {status.sprint.goal}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-brand-violet">
                Command center
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                SSOT · status.json
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Operator ready
              </span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <ActionCard
                eyebrow="Start here"
                title="서비스 이용법 확인"
                summary="새 사용자는 가이드에서 흐름과 운영 명령을 먼저 확인합니다."
                action="가이드 열기"
                tone="violet"
                onClick={() => onSelect("guide")}
              />
              <ActionCard
                eyebrow="Next signal"
                title={
                  evidenceIssues.length
                    ? `증거 ${evidenceIssues.length}건 보강`
                    : "증거 상태 양호"
                }
                summary={
                  evidenceIssues.length
                    ? "Issue, CI, Release, Smoke 증거 중 빠진 항목을 먼저 정리합니다."
                    : "현재 필수 증거 연결은 안정적입니다. 추세 지표를 확인하세요."
                }
                action="증거 보기"
                tone={evidenceIssues.length ? "amber" : "green"}
                onClick={() => onSelect("evidence")}
              />
              <ActionCard
                eyebrow="Health"
                title={`Delivery ${formatPercent(deliveryMetrics.traceCoverage)}`}
                summary="trace coverage, lead time, snapshot trend로 운영 건강도를 확인합니다."
                action="지표 보기"
                tone="green"
                onClick={() => onSelect("metrics")}
              />
            </div>
          </div>
          <div className="border-t border-zinc-100 bg-zinc-50 p-6 xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-600">전체 진행률</span>
              <span className="text-2xl font-bold text-zinc-950">
                {overallProgress}%
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar value={overallProgress} />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Lead
                </dt>
                <dd className="mt-1 font-bold text-zinc-950">
                  {leadMetric?.value ?? "N/A"}
                </dd>
              </div>
              <div className="rounded-md bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  CI
                </dt>
                <dd className="mt-1 font-bold text-zinc-950">
                  {ciMetric?.value ?? "N/A"}
                </dd>
              </div>
              <div className="rounded-md bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Snapshot
                </dt>
                <dd className="mt-1 font-bold text-zinc-950">
                  {metricSnapshots.length}
                </dd>
              </div>
              <div className="rounded-md bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Latest
                </dt>
                <dd className="mt-1 truncate font-mono text-xs font-semibold text-zinc-600">
                  {latestSnapshot
                    ? formatTimestamp(latestSnapshot.capturedAt)
                    : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-9">
        <Metric label="Phase" value={`${donePhases.length}/${status.phases.length}`} tone="violet" />
        <Metric
          label="Deliverable"
          value={`${doneDeliverables.length}/${status.deliverables.length}`}
          tone="violet"
        />
        <Metric
          label="Approval"
          value={`${approvedCount}/${status.approvals.length}`}
          tone="green"
        />
        <Metric
          label="Change"
          value={`${appliedChanges}/${status.planningChanges.length}`}
          tone="green"
        />
        <Metric
          label="Trace"
          value={`${linkedTraces}/${status.traceLinks.length}`}
          tone={linkedTraces === status.traceLinks.length ? "green" : "amber"}
        />
        <Metric
          label="Evidence"
          value={evidenceIssues.length}
          tone={evidenceIssues.length ? "amber" : "green"}
        />
        <Metric
          label="Delivery"
          value={formatPercent(deliveryMetrics.traceCoverage)}
          tone={deliveryMetrics.traceCoverage >= 95 ? "green" : "amber"}
        />
        <Metric label="Feature" value={`${doneFeatures.length}/${status.features.length}`} tone="green" />
        <Metric label="Queue" value={pendingWork.length} tone={pendingWork.length ? "amber" : "green"} />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-violet">
              Operating map
            </p>
            <h3 className="mt-1 text-xl font-bold text-zinc-950">
              P0부터 P4까지 한눈에 보기
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onSelect("phases")}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-brand-violet hover:text-brand-violet"
          >
            Gate 보기
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {status.phases.map((phase) => (
            <PhaseSignal key={phase.id} phase={phase} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <h3 className="font-bold text-zinc-950">우선 처리 작업</h3>
          <StatusBadge status={pendingWork.length ? "in_progress" : "done"} />
        </div>
        {pendingWork.length ? (
          <ul>
            {pendingWork.map((item) => (
              <QueueRow key={`${item.phaseId}-${item.id}`} item={item} />
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-sm text-zinc-500">
            현재 미완료 작업이 없습니다. v0.3 Process OS는 산출물까지 추적 중입니다.
          </p>
        )}
      </section>
    </div>
  );
}

function IntakesSection({ intakes }: { intakes: ProcessIntake[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="grid border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 md:grid-cols-[110px_1fr_160px_120px]">
        <span>ID</span>
        <span>기획 입력</span>
        <span>Source</span>
        <span>상태</span>
      </div>
      <ul>
        {intakes.map((intake) => (
          <li
            key={intake.id}
            className="grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 md:grid-cols-[110px_1fr_160px_120px] md:items-center"
          >
            <div>
              <span className="font-mono text-xs font-semibold text-brand-violet">
                {intake.id}
              </span>
              <p className="mt-1 text-xs text-zinc-500">{intake.phase}</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-950">{intake.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{intake.nextAction}</p>
              <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                {intake.doc}
              </p>
            </div>
            <p className="text-xs text-zinc-500">{intake.source}</p>
            <StatusBadge status={intake.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PlanningChangeBadge({
  status,
}: {
  status: ProcessPlanningChangeStatus;
}) {
  return (
    <span
      className={[
        "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium",
        PLANNING_CHANGE_CLASS[status],
      ].join(" ")}
    >
      {PLANNING_CHANGE_LABEL[status]}
    </span>
  );
}

function PlanningChangesSection({
  changes,
}: {
  changes: ProcessPlanningChange[];
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="grid border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:grid-cols-[100px_1fr_130px_120px]">
        <span>ID</span>
        <span>변경 요청</span>
        <span>요청일</span>
        <span>상태</span>
      </div>
      <ul>
        {changes.map((change) => (
          <li
            key={change.id}
            className="grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[100px_1fr_130px_120px] lg:items-center"
          >
            <span className="font-mono text-xs font-semibold text-brand-violet">
              {change.id}
            </span>
            <div>
              <p className="font-semibold text-zinc-950">{change.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{change.summary}</p>
              <p className="mt-1 text-xs text-zinc-500">
                결정: {change.decision}
              </p>
              <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                {change.doc}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {change.targetDocs.map((doc) => (
                  <span
                    key={doc}
                    className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-500"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
            <span className="font-mono text-xs text-zinc-500">
              {change.requestedAt}
            </span>
            <PlanningChangeBadge status={change.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DocumentViewer({ docPath }: { docPath: string }) {
  const [document, setDocument] = useState<ProcessDocumentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProcessDocument(docPath);
        if (!cancelled) setDocument(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "문서를 불러오지 못했습니다.");
          setDocument(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDocument();

    return () => {
      cancelled = true;
    };
  }, [docPath]);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
            Document
          </p>
          <h3 className="mt-1 font-bold text-zinc-950">
            {document?.title ?? docPath}
          </h3>
          <p className="mt-1 font-mono text-xs text-zinc-400">{docPath}</p>
        </div>
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500">
          {loading ? "loading" : document ? formatTimestamp(document.updatedAt) : "ready"}
        </span>
      </div>
      <div className="max-h-[560px] overflow-auto px-5 py-4">
        {error && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        {!error && loading && (
          <p className="text-sm text-zinc-500">문서 불러오는 중…</p>
        )}
        {!error && !loading && document && (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-zinc-700">
            {document.content}
          </pre>
        )}
      </div>
    </section>
  );
}

function GuideSection() {
  const [selectedPath, setSelectedPath] = useState(GUIDE_DOCS[0].path);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h3 className="font-bold text-zinc-950">운영 가이드</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            서비스 사용과 운영에 필요한 문서입니다.
          </p>
        </div>
        <div className="divide-y divide-zinc-100">
          {GUIDE_DOCS.map((doc) => (
            <button
              key={doc.path}
              type="button"
              onClick={() => setSelectedPath(doc.path)}
              className={[
                "block w-full px-4 py-4 text-left hover:bg-violet-50",
                selectedPath === doc.path ? "bg-violet-50" : "bg-white",
              ].join(" ")}
            >
              <p className="font-semibold text-zinc-950">{doc.title}</p>
              <p className="mt-1 text-sm leading-5 text-zinc-500">
                {doc.summary}
              </p>
              <p className="mt-2 truncate font-mono text-xs text-zinc-400">
                {doc.path}
              </p>
            </button>
          ))}
        </div>
      </section>
      <DocumentViewer docPath={selectedPath} />
    </div>
  );
}

function DeliverablesSection({
  deliverables,
}: {
  deliverables: ProcessDeliverable[];
}) {
  const [selectedPath, setSelectedPath] = useState(
    deliverables[0]?.doc ?? "docs/00-process/USER_MANUAL.md",
  );
  const byPhase = deliverables.reduce<Record<string, ProcessDeliverable[]>>(
    (acc, deliverable) => {
      acc[deliverable.phase] ??= [];
      acc[deliverable.phase].push(deliverable);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      <DocumentViewer docPath={selectedPath} />
      {Object.entries(byPhase).map(([phase, items]) => (
        <section key={phase} className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div>
              <p className="font-mono text-xs font-semibold text-brand-violet">
                {phase}
              </p>
              <h3 className="font-bold text-zinc-950">산출물</h3>
            </div>
            <span className="text-sm font-semibold text-zinc-500">
              {items.filter((item) => item.status === "done").length}/{items.length}
            </span>
          </div>
          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                className={[
                  "grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[90px_1fr_120px_140px_110px] lg:items-center",
                  selectedPath === item.doc ? "bg-violet-50" : "",
                ].join(" ")}
              >
                <span className="font-mono text-xs font-semibold text-zinc-500">
                  {item.id}
                </span>
                <div>
                  <p className="font-semibold text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.summary}</p>
                  <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                    {item.doc}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedPath(item.doc)}
                    className="mt-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:border-brand-violet hover:text-brand-violet"
                  >
                    문서 보기
                  </button>
                </div>
                <span className="w-fit rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                  {DELIVERABLE_TYPE_LABEL[item.type]}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {item.owner}
                </span>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ApprovalBadge({ status }: { status: ProcessApproval["status"] }) {
  const label = {
    approved: "승인",
    requested: "요청",
    changes_requested: "수정 요청",
  }[status];
  const tone = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    requested: "border-amber-200 bg-amber-50 text-amber-700",
    changes_requested: "border-rose-200 bg-rose-50 text-rose-700",
  }[status];

  return (
    <span className={["inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium", tone].join(" ")}>
      {label}
    </span>
  );
}

function ApprovalsSection({ approvals }: { approvals: ProcessApproval[] }) {
  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <article
          key={approval.id}
          className="rounded-lg border border-zinc-200 bg-white"
        >
          <div className="grid gap-4 border-b border-zinc-100 px-4 py-4 lg:grid-cols-[100px_1fr_120px] lg:items-start">
            <div>
              <span className="font-mono text-xs font-semibold text-brand-violet">
                {approval.id}
              </span>
              <p className="mt-2 w-fit rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">
                {APPROVAL_TYPE_LABEL[approval.type]}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-zinc-950">{approval.target}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {approval.summary}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                결정: {approval.decision}
              </p>
              <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                {approval.doc}
              </p>
            </div>
            <ApprovalBadge status={approval.status} />
          </div>

          <div className="grid gap-3 px-4 py-4 md:grid-cols-4">
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Driver
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {approval.driver}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
                Approver
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-900">
                {approval.approver}
              </p>
            </div>
            <div className="rounded-lg border border-violet-100 bg-violet-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">
                Contributors
              </p>
              <p className="mt-1 text-sm font-semibold text-violet-900">
                {approval.contributors.join(", ")}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Informed
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {approval.informed.join(", ")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 border-t border-zinc-100 px-4 py-4 lg:grid-cols-[1fr_220px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Approval Criteria
              </p>
              <ul className="mt-2 space-y-1">
                {approval.criteria.map((criterion) => (
                  <li key={criterion} className="text-sm text-zinc-600">
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 text-xs text-zinc-500">
              <p>
                요청일{" "}
                <span className="font-mono text-zinc-700">
                  {approval.requestedAt}
                </span>
              </p>
              <p>
                승인일{" "}
                <span className="font-mono text-zinc-700">
                  {approval.approvedAt}
                </span>
              </p>
              <div className="flex flex-wrap gap-1">
                {approval.traceLinkIds.map((id) => (
                  <span
                    key={id}
                    className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-600"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function EvidenceSection({ issues }: { issues: EvidenceIssue[] }) {
  if (!issues.length) {
    return (
      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold text-emerald-700">Evidence clear</p>
        <h3 className="mt-2 text-xl font-bold text-emerald-950">
          누락된 운영 증거가 없습니다
        </h3>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          모든 trace link가 산출물, 승인, 개발 증거, 배포 증거 기준을 충족합니다.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {(["high", "medium", "low"] as EvidenceSeverity[]).map((severity) => {
        const items = issues.filter((issue) => issue.severity === severity);
        if (!items.length) return null;

        return (
          <section
            key={severity}
            className="rounded-lg border border-zinc-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {EVIDENCE_SEVERITY_LABEL[severity]}
                </p>
                <h3 className="font-bold text-zinc-950">증거 보강 항목</h3>
              </div>
              <span
                className={[
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  EVIDENCE_SEVERITY_CLASS[severity],
                ].join(" ")}
              >
                {items.length}
              </span>
            </div>
            <ul>
              {items.map((issue) => (
                <li
                  key={`${issue.traceId}-${issue.label}`}
                  className="grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[90px_150px_1fr_260px] lg:items-start"
                >
                  <span className="font-mono text-xs font-semibold text-brand-violet">
                    {issue.traceId}
                  </span>
                  <span
                    className={[
                      "w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      EVIDENCE_SEVERITY_CLASS[issue.severity],
                    ].join(" ")}
                  >
                    {issue.label}
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-950">{issue.title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {issue.detail}
                    </p>
                  </div>
                  <p className="text-xs leading-5 text-zinc-600">
                    {issue.nextAction}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

type MetricTrendKey =
  | "leadTimeHours"
  | "ciSuccessRate"
  | "evidenceCompleteness"
  | "traceCoverage";

interface MetricTrendDefinition {
  key: MetricTrendKey;
  label: string;
  unit: string;
  summary: string;
  format: (value: number | null) => string;
}

const METRIC_TREND_DEFINITIONS: MetricTrendDefinition[] = [
  {
    key: "leadTimeHours",
    label: "Lead time",
    unit: "hours",
    summary: "요청에서 smoke/release 증거까지 평균 시간",
    format: formatDuration,
  },
  {
    key: "ciSuccessRate",
    label: "CI success",
    unit: "%",
    summary: "연결된 GitHub Actions run 성공률",
    format: formatPercent,
  },
  {
    key: "evidenceCompleteness",
    label: "Evidence",
    unit: "%",
    summary: "trace별 증거 누락을 반영한 완성도",
    format: formatPercent,
  },
  {
    key: "traceCoverage",
    label: "Coverage",
    unit: "%",
    summary: "linked/released trace 비율",
    format: formatPercent,
  },
];

function MetricTrendChart({
  snapshots,
  definition,
}: {
  snapshots: ProcessMetricSnapshot[];
  definition: MetricTrendDefinition;
}) {
  const points = snapshots
    .map((snapshot) => ({
      id: snapshot.id,
      value: snapshot.delivery[definition.key],
    }))
    .filter((point): point is { id: string; value: number } =>
      typeof point.value === "number",
    );
  const latest = points.at(-1);
  const width = 520;
  const height = 160;
  const paddingX = 34;
  const paddingY = 24;
  const values = points.map((point) => point.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(1, ...values);
  const range = Math.max(maxValue - minValue, 1);
  const toX = (index: number) =>
    points.length === 1
      ? width / 2
      : paddingX +
        (index * (width - paddingX * 2)) / Math.max(points.length - 1, 1);
  const toY = (value: number) =>
    height - paddingY - ((value - minValue) / range) * (height - paddingY * 2);
  const linePoints = points
    .map((point, index) => `${toX(index)},${toY(point.value)}`)
    .join(" ");

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {definition.label}
          </p>
          <p className="mt-1 text-sm leading-5 text-zinc-500">
            {definition.summary}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-zinc-950">
            {latest ? definition.format(latest.value) : "N/A"}
          </p>
          <p className="text-xs font-semibold text-zinc-400">
            {definition.unit}
          </p>
        </div>
      </div>
      {points.length > 0 ? (
        <div className="mt-5 overflow-hidden rounded-md border border-zinc-100 bg-zinc-50">
          <svg
            role="img"
            aria-label={`${definition.label} trend`}
            viewBox={`0 0 ${width} ${height}`}
            className="h-44 w-full"
            preserveAspectRatio="none"
          >
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#d4d4d8"
              strokeWidth="1"
            />
            <line
              x1={paddingX}
              y1={paddingY}
              x2={paddingX}
              y2={height - paddingY}
              stroke="#e4e4e7"
              strokeWidth="1"
            />
            <polyline
              points={linePoints}
              fill="none"
              stroke="#7c3aed"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            {points.map((point, index) => (
              <circle
                key={point.id}
                cx={toX(index)}
                cy={toY(point.value)}
                r="4"
                fill="#7c3aed"
                stroke="#ffffff"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
          snapshot 데이터가 아직 없습니다.
        </div>
      )}
    </article>
  );
}

function MetricSnapshotsSection({
  snapshots,
}: {
  snapshots: ProcessMetricSnapshot[];
}) {
  const latestSnapshots = snapshots.slice(-5).reverse();

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-bold text-zinc-950">Snapshot trend</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            pnpm snapshot:metrics로 저장한 지표 이력을 기준으로 추세를 봅니다.
          </p>
        </div>
        <p className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500">
          {snapshots.length} snapshots
        </p>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {METRIC_TREND_DEFINITIONS.map((definition) => (
          <MetricTrendChart
            key={definition.key}
            snapshots={snapshots}
            definition={definition}
          />
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200">
        <div className="grid bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:grid-cols-[190px_120px_120px_120px_120px_1fr]">
          <span>Captured</span>
          <span>Lead</span>
          <span>CI</span>
          <span>Evidence</span>
          <span>Coverage</span>
          <span>Source</span>
        </div>
        <ul>
          {latestSnapshots.map((snapshot) => (
            <li
              key={snapshot.id}
              className="grid gap-2 border-t border-zinc-100 px-4 py-3 text-sm lg:grid-cols-[190px_120px_120px_120px_120px_1fr] lg:items-center"
            >
              <span className="font-mono text-xs text-zinc-500">
                {formatTimestamp(snapshot.capturedAt)}
              </span>
              <span className="font-semibold text-zinc-800">
                {formatDuration(snapshot.delivery.leadTimeHours)}
              </span>
              <span className="font-semibold text-zinc-800">
                {formatPercent(snapshot.delivery.ciSuccessRate)}
              </span>
              <span className="font-semibold text-zinc-800">
                {formatPercent(snapshot.delivery.evidenceCompleteness)}
              </span>
              <span className="font-semibold text-zinc-800">
                {formatPercent(snapshot.delivery.traceCoverage)}
              </span>
              <span className="text-xs text-zinc-500">
                {snapshot.source.systemVersion} · {snapshot.source.headSha ?? "no sha"}
              </span>
            </li>
          ))}
          {latestSnapshots.length === 0 && (
            <li className="border-t border-zinc-100 px-4 py-6 text-sm text-zinc-500">
              아직 저장된 metrics snapshot이 없습니다.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

function DeliveryMetricsSection({
  metrics,
  snapshots,
}: {
  metrics: DeliveryMetrics;
  snapshots: ProcessMetricSnapshot[];
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metrics.cards.map((metric) => (
          <article
            key={metric.label}
            className={[
              "rounded-lg border p-4",
              DELIVERY_METRIC_TONE_CLASS[metric.tone],
            ].join(" ")}
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {metric.label}
            </p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-3xl font-bold">{metric.value}</p>
              {metric.unit && (
                <p className="pb-1 text-xs font-semibold opacity-70">
                  {metric.unit}
                </p>
              )}
            </div>
            <p className="mt-3 text-xs leading-5 opacity-75">
              {metric.summary}
            </p>
          </article>
        ))}
      </section>

      <MetricSnapshotsSection snapshots={snapshots} />

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Evidence completeness
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-950">
            {formatPercent(metrics.evidenceCompleteness)}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            증거 메뉴의 누락 경고를 기반으로 계산한 trace 건강도입니다.
          </p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Smoke pass rate
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-950">
            {formatPercent(metrics.smokePassRate)}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            기록된 smoke 증거 중 pass 비율입니다.
          </p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Trace coverage
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-950">
            {formatPercent(metrics.traceCoverage)}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            commit과 CI run이 연결된 trace 비율입니다.
          </p>
        </article>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h3 className="font-bold text-zinc-950">Trace lead time</h3>
          <p className="mt-1 text-xs text-zinc-500">
            GitHub commit/CI timestamp와 smoke/release 증거를 기준으로 단계별 시간을 계산합니다.
          </p>
        </div>
        <div className="grid border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:grid-cols-[90px_1fr_120px_120px_120px_100px_90px_90px]">
          <span>ID</span>
          <span>대상</span>
          <span>요청→커밋</span>
          <span>커밋→CI</span>
          <span>CI→증거</span>
          <span>전체</span>
          <span>CI</span>
          <span>Smoke</span>
        </div>
        <ul>
          {metrics.traceRows.map((row) => (
            <li
              key={row.id}
              className="grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[90px_1fr_120px_120px_120px_100px_90px_90px] lg:items-center"
            >
              <span className="font-mono text-xs font-semibold text-brand-violet">
                {row.id}
              </span>
              <div>
                <p className="font-semibold text-zinc-950">{row.title}</p>
                {row.evidenceWarnings > 0 && (
                  <p className="mt-1 text-xs text-amber-700">
                    증거 보강 {row.evidenceWarnings}건
                  </p>
                )}
              </div>
              <span className="font-semibold text-zinc-700">
                {formatDuration(row.requestToCommitHours)}
              </span>
              <span className="font-semibold text-zinc-700">
                {formatDuration(row.commitToCiHours)}
              </span>
              <span className="font-semibold text-zinc-700">
                {formatDuration(row.ciToDeliveryHours)}
              </span>
              <span className="font-semibold text-zinc-900">
                {formatDuration(row.totalLeadHours)}
              </span>
              <span className="text-xs font-semibold text-zinc-600">
                {row.ciStatus}
              </span>
              <span className="text-xs font-semibold text-zinc-600">
                {row.smokeStatus}
              </span>
              <div className="lg:col-span-8">
                <p className="font-mono text-[11px] leading-5 text-zinc-400">
                  request {formatTimestamp(row.requestedAt)} · commit{" "}
                  {formatTimestamp(row.committedAt)} · ci{" "}
                  {formatTimestamp(row.ciCompletedAt)} · evidence{" "}
                  {formatTimestamp(row.deliveredAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function TraceStatusBadge({ status }: { status: ProcessTraceStatus }) {
  return (
    <span
      className={[
        "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TRACE_STATUS_CLASS[status],
      ].join(" ")}
    >
      {TRACE_STATUS_LABEL[status]}
    </span>
  );
}

function TraceReferenceBadge({
  label,
  status,
  url,
}: {
  label: string;
  status: ProcessTraceReferenceStatus;
  url?: string;
}) {
  const className = [
    "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium",
    TRACE_REFERENCE_CLASS[status],
  ].join(" ");

  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {label}: {TRACE_REFERENCE_LABEL[status]}
      </a>
    );
  }

  return (
    <span className={className}>
      {label}: {TRACE_REFERENCE_LABEL[status]}
    </span>
  );
}

function TraceabilitySection({
  traces,
  evidenceIssues,
}: {
  traces: ProcessTraceLink[];
  evidenceIssues: EvidenceIssue[];
}) {
  return (
    <div className="space-y-4">
      {traces.map((trace) => {
        const warningCount = evidenceIssues.filter(
          (issue) => issue.traceId === trace.id,
        ).length;

        return (
          <article
            key={trace.id}
            className="rounded-lg border border-zinc-200 bg-white"
          >
          <div className="grid gap-4 border-b border-zinc-100 px-4 py-4 lg:grid-cols-[100px_1fr_120px] lg:items-start">
            <span className="font-mono text-xs font-semibold text-brand-violet">
              {trace.id}
            </span>
            <div>
              <h3 className="font-bold text-zinc-950">{trace.title}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {trace.summary}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                다음 액션: {trace.nextAction}
              </p>
              {warningCount > 0 && (
                <p className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  증거 보강 {warningCount}건
                </p>
              )}
            </div>
            <TraceStatusBadge status={trace.status} />
          </div>

          <div className="grid gap-4 px-4 py-4 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Source
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {[...trace.sourceIds, ...trace.changeIds].map((id) => (
                  <span
                    key={id}
                    className="rounded-md bg-violet-50 px-2 py-1 font-mono text-[11px] font-semibold text-violet-700"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Deliverables
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {trace.deliverableIds.map((id) => (
                  <span
                    key={id}
                    className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-600"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Flow Evidence
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <TraceReferenceBadge {...trace.issue} label="Issue" />
                <TraceReferenceBadge {...trace.pr} label="PR" />
                <TraceReferenceBadge {...trace.release} label="Release" />
                {trace.smoke && (
                  <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    Smoke: {trace.smoke.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-zinc-100 px-4 py-4 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Commits
              </p>
              <ul className="mt-2 space-y-2">
                {trace.commits.map((commit) => (
                  <li key={commit.sha} className="text-sm">
                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs font-semibold text-brand-violet hover:underline"
                    >
                      {commit.sha}
                    </a>
                    <span className="ml-2 text-zinc-600">{commit.message}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                CI Runs
              </p>
              <ul className="mt-2 space-y-2">
                {trace.ciRuns.map((run) => (
                  <li key={run.id} className="text-sm">
                    <a
                      href={run.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs font-semibold text-brand-violet hover:underline"
                    >
                      {run.id}
                    </a>
                    <span className="ml-2 text-zinc-600">{run.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Release Smoke
              </p>
              {trace.smoke ? (
                <div className="mt-2 space-y-1 text-sm text-zinc-600">
                  <p className="font-semibold text-zinc-900">
                    {trace.smoke.status}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">
                    {trace.smoke.command}
                  </p>
                  <p className="text-xs leading-5 text-zinc-500">
                    {trace.smoke.summary}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-400">아직 없음</p>
              )}
            </div>
          </div>
        </article>
        );
      })}
    </div>
  );
}

function QueueSection({
  queue,
}: {
  queue: Array<ProcessCheckItem & { phaseId: string; phaseName: string }>;
}) {
  return (
    <div className="space-y-4">
      {STATUS_ORDER.map((status) => {
        const items = queue.filter((item) => item.status === status);
        return (
          <section key={status} className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <h3 className="font-bold text-zinc-950">{STATUS_TITLE[status]}</h3>
              <span className="text-sm font-semibold text-zinc-500">
                {items.length}
              </span>
            </div>
            {items.length ? (
              <ul>
                {items.map((item) => (
                  <QueueRow key={`${item.phaseId}-${item.id}`} item={item} />
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-sm text-zinc-500">항목 없음</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function FeaturesSection({ features }: { features: ProcessCheckItem[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="grid border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 md:grid-cols-[120px_1fr_110px]">
        <span>ID</span>
        <span>기능</span>
        <span>상태</span>
      </div>
      <ul>
        {features.map((feature) => (
          <li
            key={feature.id}
            className="grid gap-3 border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[120px_1fr_110px] md:items-center"
          >
            <span className="font-mono text-xs font-semibold text-zinc-500">
              {feature.id}
            </span>
            <span className="font-medium text-zinc-900">{feature.label}</span>
            <StatusBadge status={feature.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const DESIGN_CATEGORY_LABEL: Record<ProcessDesignReference["category"], string> = {
  foundation: "Foundation",
  component: "Component",
  pattern: "Pattern",
  commerce: "Commerce",
  accessibility: "Accessibility",
};

function DesignReferenceCard({
  reference,
}: {
  reference: ProcessDesignReference;
}) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold text-brand-violet">
            {reference.id}
          </p>
          <h3 className="mt-1 text-lg font-bold text-zinc-950">
            {reference.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{reference.source}</p>
        </div>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-brand-violet">
          {DESIGN_CATEGORY_LABEL[reference.category]}
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {reference.takeaways.map((item) => (
          <li key={item} className="text-sm leading-6 text-zinc-600">
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {reference.applyTo.map((target) => (
          <span
            key={target}
            className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600"
          >
            {target}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <a
          href={reference.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-brand-violet hover:underline"
        >
          레퍼런스 열기 →
        </a>
        <p className="truncate font-mono text-xs text-zinc-400">
          {reference.doc}
        </p>
      </div>
    </article>
  );
}

function DesignArtifactRow({
  item,
}: {
  item: ProcessWireframe | ProcessStoryboard;
}) {
  const meta =
    "fidelity" in item
      ? `${item.screen} · ${item.fidelity}`
      : `${item.actor} · ${item.linkedWireframes.join(", ")}`;

  return (
    <li className="grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[90px_1fr_130px_110px] lg:items-center">
      <span className="font-mono text-xs font-semibold text-brand-violet">
        {item.id}
      </span>
      <div>
        <p className="font-semibold text-zinc-950">{item.title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{item.summary}</p>
        <p className="mt-1 truncate font-mono text-xs text-zinc-400">
          {item.doc}
        </p>
      </div>
      <span className="text-xs text-zinc-500">{meta}</span>
      <StatusBadge status={item.status} />
    </li>
  );
}

function DesignSection({
  references,
  wireframes,
  storyboards,
}: {
  references: ProcessDesignReference[];
  wireframes: ProcessWireframe[];
  storyboards: ProcessStoryboard[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-violet">
              Design OS
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
              레퍼런스에서 스토리보드까지 한 흐름으로 관리
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              디자인 시스템, 외부 레퍼런스, 와이어프레임, 스토리보드를
              개발 전 산출물로 남기고 trace와 승인 흐름에 연결합니다.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Reference" value={references.length} tone="violet" />
            <Metric label="Wireframe" value={wireframes.length} tone="green" />
            <Metric label="Storyboard" value={storyboards.length} tone="green" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-sm font-semibold text-brand-violet">
            Reference Board
          </p>
          <h3 className="mt-1 text-xl font-bold text-zinc-950">
            차용할 점과 적용 화면
          </h3>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {references.map((reference) => (
            <DesignReferenceCard key={reference.id} reference={reference} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
              Wireframes
            </p>
            <h3 className="mt-1 font-bold text-zinc-950">
              화면 구조와 정보 우선순위
            </h3>
          </div>
          <ul>
            {wireframes.map((wireframe) => (
              <DesignArtifactRow key={wireframe.id} item={wireframe} />
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
              Storyboards
            </p>
            <h3 className="mt-1 font-bold text-zinc-950">
              사용자 흐름과 handoff 기준
            </h3>
          </div>
          <ul>
            {storyboards.map((storyboard) => (
              <DesignArtifactRow key={storyboard.id} item={storyboard} />
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

function AppsSection({ apps }: { apps: ProcessApp[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {apps.map((app) => (
        <article
          key={app.id}
          className="rounded-lg border border-zinc-200 bg-white p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold text-brand-violet">
                :{app.port}
              </p>
              <h3 className="mt-1 text-lg font-bold text-zinc-950">
                {app.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{app.role}</p>
            </div>
            <a
              href={app.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-brand-violet hover:text-brand-violet"
            >
              열기
            </a>
          </div>
          <p className="mt-5 truncate rounded-md bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-500">
            {app.url}
          </p>
        </article>
      ))}
    </section>
  );
}

export default function App() {
  const [status, setStatus] = useState<ProcessStatus | null>(null);
  const [metricSnapshots, setMetricSnapshots] = useState<ProcessMetricSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  const load = useCallback(async () => {
    setError(null);
    try {
      const [data, snapshots] = await Promise.all([
        fetchProcessStatus(),
        fetchProcessMetricSnapshots(),
      ]);
      setStatus(data);
      setMetricSnapshots(snapshots.snapshots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30_000);
    return () => clearInterval(timer);
  }, [load]);

  const queue = useMemo(
    () => (status ? buildQueue(status.phases) : []),
    [status],
  );
  const evidenceIssues = useMemo(
    () => (status ? buildEvidenceIssues(status.traceLinks) : []),
    [status],
  );
  const deliveryMetrics = useMemo(
    () =>
      status
        ? buildDeliveryMetrics(status, evidenceIssues)
        : {
            cards: [],
            traceRows: [],
            evidenceCompleteness: 0,
            smokePassRate: null,
            traceCoverage: 0,
          },
    [status, evidenceIssues],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        프로세스 상태 불러오는 중…
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-rose-600">API 오류: {error ?? "no data"}</p>
        <p className="text-sm text-zinc-500">
          api-server(:4000)가 실행 중인지 확인하세요.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-brand-violet px-4 py-2 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const overallProgress = Math.round(
    status.phases.reduce((sum, p) => sum + p.progress, 0) /
      status.phases.length,
  );
  const active = SECTIONS.find((section) => section.id === activeSection);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 lg:flex">
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        status={status}
        overallProgress={overallProgress}
        evidenceIssueCount={evidenceIssues.length}
      />

      <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">
        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-violet">
                {active?.eyebrow}
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                {active?.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {active ? SECTION_COPY[active.id] : "프로세스 상태 확인"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {status.sprint.status === "done" ? "완료" : status.sprint.status}
              </span>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-brand-violet hover:text-brand-violet"
              >
                새로고침
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 text-xs text-zinc-500 md:grid-cols-4">
            <div>
              <p className="font-semibold uppercase tracking-wider text-zinc-400">
                Sprint
              </p>
              <p className="mt-1 font-bold text-zinc-800">{status.sprint.id}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-zinc-400">
                Version
              </p>
              <p className="mt-1 font-bold text-zinc-800">{status.systemVersion}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-zinc-400">
                Updated
              </p>
              <p className="mt-1 font-mono font-semibold text-zinc-700">
                {status.updatedAt}
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-zinc-400">
                Section
              </p>
              <p className="mt-1 font-bold text-zinc-800">{active?.label}</p>
            </div>
          </div>
        </header>

        {activeSection === "overview" && (
          <OverviewSection
            status={status}
            overallProgress={overallProgress}
            queue={queue}
            evidenceIssues={evidenceIssues}
            deliveryMetrics={deliveryMetrics}
            metricSnapshots={metricSnapshots}
            onSelect={setActiveSection}
          />
        )}

        {activeSection === "intakes" && (
          <IntakesSection intakes={status.intakes} />
        )}

        {activeSection === "changes" && (
          <PlanningChangesSection changes={status.planningChanges} />
        )}

        {activeSection === "design" && (
          <DesignSection
            references={status.designReferences}
            wireframes={status.wireframes}
            storyboards={status.storyboards}
          />
        )}

        {activeSection === "guide" && <GuideSection />}

        {activeSection === "deliverables" && (
          <DeliverablesSection deliverables={status.deliverables} />
        )}

        {activeSection === "approvals" && (
          <ApprovalsSection approvals={status.approvals} />
        )}

        {activeSection === "evidence" && (
          <EvidenceSection issues={evidenceIssues} />
        )}

        {activeSection === "metrics" && (
          <DeliveryMetricsSection
            metrics={deliveryMetrics}
            snapshots={metricSnapshots}
          />
        )}

        {activeSection === "traceability" && (
          <TraceabilitySection
            traces={status.traceLinks}
            evidenceIssues={evidenceIssues}
          />
        )}

        {activeSection === "phases" && (
          <section className="grid gap-4 xl:grid-cols-2">
            {status.phases.map((phase) => (
              <PhasePanel key={phase.id} phase={phase} />
            ))}
          </section>
        )}

        {activeSection === "queue" && <QueueSection queue={queue} />}

        {activeSection === "features" && (
          <FeaturesSection features={status.features} />
        )}

        {activeSection === "apps" && <AppsSection apps={status.apps} />}
      </main>
    </div>
  );
}
