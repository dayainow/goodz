import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import type {
  CreateProcessTemplateRequest,
  ProcessApp,
  ProcessApproval,
  ProcessCheckItem,
  ProcessDesignReference,
  ProcessDeliverable,
  ProcessDeliverableRun,
  ProcessDeliverableType,
  ProcessDocumentResponse,
  ProcessIntake,
  ProcessIncidentSeverity,
  ProcessItemStatus,
  ProcessGateDecision,
  ProcessMetricSnapshot,
  ProcessOperationsOverview,
  ProcessPhase,
  ProcessPlanningChange,
  ProcessPlanningChangeStatus,
  ProcessRun,
  ProcessStatus,
  ProcessTemplate,
  ProcessTraceLink,
  ProcessTraceReferenceStatus,
  ProcessTraceStatus,
  ProcessWireframe,
  ProcessWorkspaceOverview,
  ProcessStoryboard,
} from "@goodz/process";
import {
  createProcessProject,
  createProcessEvidence,
  createProcessTemplate,
  createProcessIncident,
  decideProcessGate,
  fetchProcessDocument,
  fetchProcessMetricSnapshots,
  fetchProcessOperations,
  fetchProcessStatus,
  fetchProcessWorkspace,
  resolveProcessIncident,
  updateProcessStage,
  updateProcessDeliverable,
  updateProcessTask,
} from "./api/process";
import { PhasePanel } from "./components/PhasePanel";
import { ProjectWorkbench } from "./components/ProjectWorkbench";
import { ProgressBar, StatusBadge } from "./components/StatusBadge";

const MarkdownDocument = lazy(() => import("./components/MarkdownDocument"));

type SectionId =
  | "overview"
  | "workspace"
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
  | "operations"
  | "apps";

const SECTIONS: Array<{ id: SectionId; label: string; eyebrow: string }> = [
  { id: "overview", label: "개요", eyebrow: "Overview" },
  { id: "workspace", label: "프로젝트", eyebrow: "Control Plane" },
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
  { id: "operations", label: "운영 DB", eyebrow: "SQLite" },
  { id: "apps", label: "앱", eyebrow: "Services" },
];

const SECTION_MAP = new Map(SECTIONS.map((section) => [section.id, section]));

const SECTION_COPY: Record<SectionId, string> = {
  overview: "현재 상태와 오늘 볼 신호",
  workspace: "프로젝트 생성과 프로세스 실행",
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
  operations: "Incident와 문서 인덱스",
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
    items: ["overview", "workspace", "guide"],
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
    items: ["phases", "queue", "features", "operations", "apps"],
  },
];

const SECTION_GROUP = new Map<SectionId, string>(
  MENU_GROUPS.flatMap((group) =>
    group.items.map((sectionId) => [sectionId, group.title] as const),
  ),
);

const QUICK_SECTIONS: SectionId[] = ["overview", "workspace", "guide", "metrics"];

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
  neutral: "border-zinc-200 border-l-zinc-300 bg-white text-zinc-950",
  good: "border-zinc-200 border-l-emerald-500 bg-white text-zinc-950",
  watch: "border-zinc-200 border-l-amber-500 bg-white text-zinc-950",
  risk: "border-zinc-200 border-l-rose-500 bg-white text-zinc-950",
};

const SHADOW_L1 =
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]";
const SHADOW_L2 =
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)]";
const CARD_SURFACE = `rounded-2xl border border-zinc-200 bg-white ${SHADOW_L1}`;
const META_LABEL =
  "text-[12px] font-semibold uppercase tracking-wider text-zinc-500";
const PRIMARY_ACTION =
  "border-zinc-950 bg-zinc-950 text-white hover:border-zinc-800 hover:bg-zinc-800";
const QUIET_ACTION =
  "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950";

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
}: {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
  status: ProcessStatus;
}) {
  const [query, setQuery] = useState("");
  const activeGroupTitle = SECTION_GROUP.get(activeSection) ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroupTitle);
  const normalizedQuery = query.trim().toLowerCase();
  const selectSection = useCallback(
    (sectionId: SectionId) => {
      setOpenGroup(SECTION_GROUP.get(sectionId) ?? null);
      onSelect(sectionId);
    },
    [onSelect],
  );

  useEffect(() => {
    setOpenGroup(activeGroupTitle);
  }, [activeGroupTitle]);

  return (
    <aside className="border-b border-zinc-200 bg-[#F7F7F7] px-5 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[360px] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <p className={META_LABEL}>
            Goodz System
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-950">
            프로세스 관리
          </h1>
        </div>
        <div className="pt-1">
          <StatusBadge status={status.sprint.status} />
        </div>
      </div>

      <div className={["mt-5 shrink-0 p-4", CARD_SURFACE].join(" ")}>
        <label htmlFor="nav-search" className="sr-only">
          메뉴 검색
        </label>
        <input
          id="nav-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="메뉴 검색"
          className="h-10 w-full rounded-lg border border-zinc-200 bg-[#FAFAFA] px-3 text-sm font-medium text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:ring-2 focus:ring-zinc-200"
        />
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Quick jump
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_SECTIONS.map((id) => {
              const section = SECTION_MAP.get(id);
              if (!section) return null;
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectSection(id)}
                  className={[
                    "rounded-xl border px-2 py-2 text-xs font-bold transition duration-150",
                    isActive
                      ? PRIMARY_ACTION
                      : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-200 hover:text-zinc-950",
                  ].join(" ")}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="sidebar-scroll mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pb-8 pr-3">
        {MENU_GROUPS.map((group) => {
          const visibleItems = group.items.filter((id) => {
            const section = SECTION_MAP.get(id);
            if (!section) return false;
            return (
              !normalizedQuery ||
              section.label.toLowerCase().includes(normalizedQuery) ||
              section.eyebrow.toLowerCase().includes(normalizedQuery) ||
              SECTION_COPY[section.id].toLowerCase().includes(normalizedQuery)
            );
          });
          const isCollapsed = !normalizedQuery && openGroup !== group.title;

          if (normalizedQuery && visibleItems.length === 0) return null;

          return (
            <section
              key={group.title}
              className="border-b border-zinc-200 pb-3 last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setOpenGroup((current) =>
                    current === group.title ? null : group.title,
                  )
                }
                aria-controls={`sidebar-group-${group.title.toLowerCase()}`}
                className={[
                  "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-left transition duration-150 hover:bg-zinc-200/80",
                  isCollapsed ? "" : "bg-zinc-100",
                ].join(" ")}
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {group.title}
                  </p>
                  <p className="text-[11px] text-zinc-500">{group.summary}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-semibold text-zinc-600">
                  <span
                    aria-hidden="true"
                    className={[
                      "inline-block text-sm transition-transform duration-150",
                      isCollapsed ? "rotate-0" : "rotate-90",
                    ].join(" ")}
                  >
                    ›
                  </span>
                  {isCollapsed ? "열기" : `${visibleItems.length}/${group.items.length}`}
                </span>
              </button>
              {!isCollapsed && (
                <div
                  id={`sidebar-group-${group.title.toLowerCase()}`}
                  className="mt-2 grid grid-cols-1 gap-2"
                >
                  {visibleItems.map((id) => {
                    const section = SECTION_MAP.get(id);
                    if (!section) return null;
                    const isActive = section.id === activeSection;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => selectSection(section.id)}
                        className={[
                          "flex min-h-14 items-center justify-between rounded-xl border border-l-[3px] px-3.5 py-2.5 text-left transition duration-150",
                          isActive
                            ? `border-zinc-300 border-l-violet-500 bg-white text-zinc-950 ${SHADOW_L1}`
                            : "border-zinc-200 border-l-transparent bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-950",
                        ].join(" ")}
                      >
                        <span className="min-w-0">
                          <span
                            className={[
                              "block text-[11px] font-semibold uppercase tracking-wider",
                              isActive ? "text-violet-700" : "text-zinc-500",
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
                              isActive ? "text-zinc-600" : "text-zinc-500",
                            ].join(" ")}
                          >
                            {SECTION_COPY[section.id]}
                          </span>
                        </span>
                        <span aria-hidden="true" className={isActive ? "text-lg leading-none text-violet-600" : "text-lg leading-none text-zinc-400"}>
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

      <div className="mt-3 hidden shrink-0 border-t border-zinc-200 bg-[#F7F7F7] pt-4 text-xs text-zinc-500 lg:block">
        <p className="font-semibold text-zinc-600">SSOT</p>
        <p className="mt-1 font-mono">Git documents + Operations DB</p>
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
    neutral: "border-l-zinc-300",
    violet: "border-l-zinc-950",
    green: "border-l-emerald-500",
    amber: "border-l-amber-500",
  }[tone];

  return (
    <div
      className={[
        `rounded-2xl border border-zinc-200 border-l-[3px] bg-white p-4 ${SHADOW_L1}`,
        toneClass,
      ].join(" ")}
    >
      <p className={META_LABEL}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-zinc-950">{value}</p>
    </div>
  );
}

function ActionCard({
  eyebrow,
  title,
  summary,
  action,
  variant = "signal",
  onClick,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  action: string;
  variant?: "primary" | "signal" | "health";
  onClick: () => void;
}) {
  const variantClass = {
    primary:
      `border-zinc-300 border-l-[3px] border-l-violet-500 bg-white ${SHADOW_L2}`,
    signal: `border-zinc-300 bg-white ${SHADOW_L1}`,
    health: `border-zinc-300 bg-white ${SHADOW_L1}`,
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-5 text-left transition duration-150 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_rgba(0,0,0,0.07)]",
        variantClass,
      ].join(" ")}
    >
      <p className={META_LABEL}>
        {eyebrow}
      </p>
      <h3
        className={[
          "mt-2 font-bold leading-[1.15] text-zinc-950",
          variant === "primary"
            ? "text-lg"
            : variant === "health"
              ? "text-3xl tracking-tight"
              : "text-base",
        ].join(" ")}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{summary}</p>
      <p className="mt-4 text-sm font-semibold text-zinc-950">
        {action} →
      </p>
    </button>
  );
}

function PhaseSignal({
  phase,
  isCurrent,
}: {
  phase: ProcessPhase;
  isCurrent: boolean;
}) {
  const isDone = phase.status === "done";

  return (
    <div
      className={[
        "h-full rounded-2xl border p-4 transition duration-150 hover:-translate-y-1",
        isDone
          ? "border-zinc-950 bg-zinc-950 text-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)]"
          : "border-zinc-300 bg-white text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        isCurrent
          ? "border-l-[3px] border-l-violet-400 ring-2 ring-violet-400 ring-offset-2 ring-offset-[#F4F4F5]"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={[
              "font-mono text-xs font-semibold",
              isDone ? "text-white/55" : "text-zinc-500",
            ].join(" ")}
          >
            {phase.id}
          </p>
          <h3 className={["mt-1 font-bold", isDone ? "text-white" : "text-zinc-950"].join(" ")}>
            {phase.name}
          </h3>
        </div>
        {isCurrent ? (
          <span className="rounded-full border border-violet-300/60 bg-violet-400/15 px-2.5 py-0.5 text-xs font-semibold text-violet-100">
            현재 운영
          </span>
        ) : (
          <StatusBadge status={phase.status} />
        )}
      </div>
      <div className="mt-4">
        <ProgressBar value={phase.progress} />
      </div>
      <p className={["mt-2 text-xs", isDone ? "text-white/55" : "text-zinc-500"].join(" ")}>
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

function OverviewMetricGroup({
  title,
  value,
  summary,
  rows,
  variant,
}: {
  title: string;
  value: string | number;
  summary: string;
  rows: Array<{ label: string; value: string | number }>;
  variant: "completion" | "delivery";
}) {
  const surfaceClass = {
    completion:
      "border-emerald-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]",
    delivery: "border-zinc-200 bg-[#F7F7F7] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  }[variant];

  return (
    <article
      className={[
        "rounded-2xl border p-5 transition duration-150 hover:-translate-y-1",
        surfaceClass,
      ].join(" ")}
    >
      <p className={META_LABEL}>{title}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        {variant === "completion" ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
            <span aria-hidden="true">✓</span>
            완료 · {value}
          </p>
        ) : (
          <p className="text-3xl font-bold tracking-tight text-zinc-950">
            {value}
          </p>
        )}
        <p className="max-w-40 text-right text-xs leading-5 text-zinc-500">
          {summary}
        </p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-zinc-100 bg-[#FAFAFA] p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm font-bold text-zinc-950">{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
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
  const leadMetric = deliveryMetrics.cards.find(
    (metric) => metric.label === "Lead time",
  );
  const ciMetric = deliveryMetrics.cards.find(
    (metric) => metric.label === "CI success rate",
  );
  const deliveryMetric = deliveryMetrics.cards.find(
    (metric) => metric.label === "Deployment frequency",
  );
  const currentPhaseId =
    status.phases.find((phase) => phase.status === "in_progress")?.id ?? "P2";

  return (
    <div className="space-y-6">
      <section className={["overflow-hidden", CARD_SURFACE].join(" ")}>
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="p-6">
            <p className="text-sm font-semibold text-brand-violet">
              현재 Sprint · {status.sprint.id}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 lg:text-[32px]">
              {status.sprint.name}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              {status.sprint.goal}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                Command center
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                SSOT · status.json
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                Operator ready
              </span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-[1.2fr_1fr_0.9fr]">
              <ActionCard
                eyebrow="Start here"
                title="서비스 이용법 확인"
                summary="새 사용자는 가이드에서 흐름과 운영 명령을 먼저 확인합니다."
                action="가이드 열기"
                variant="primary"
                onClick={() => onSelect("guide")}
              />
              <ActionCard
                eyebrow="Next signal"
                title={
                  evidenceIssues.length
                    ? `검토할 신호 ${evidenceIssues.length}건`
                    : "모든 증거 연결 완료"
                }
                summary={
                  evidenceIssues.length
                    ? "Issue, CI, Release, Smoke 중 확인할 연결 상태를 정리했습니다."
                    : "필수 연결이 모두 완료되었습니다. 추세 지표를 확인하세요."
                }
                action="증거 보기"
                variant="signal"
                onClick={() => onSelect("evidence")}
              />
              <ActionCard
                eyebrow="Health"
                title={formatPercent(deliveryMetrics.traceCoverage)}
                summary={
                  deliveryMetrics.traceCoverage >= 100
                    ? "모든 추적 연결 완료"
                    : "운영 건강도와 추적 범위"
                }
                action="지표 보기"
                variant="health"
                onClick={() => onSelect("metrics")}
              />
            </div>
          </div>
          <div className="border-t border-zinc-100 bg-[#FAFAFA] p-6 xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-600">Trace coverage</span>
              <span className="text-2xl font-bold text-zinc-950">
                {formatPercent(deliveryMetrics.traceCoverage)}
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar value={deliveryMetrics.traceCoverage} />
            </div>
            <div className="my-5 border-t border-zinc-200" />
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
              <div className="rounded-xl border border-zinc-100 bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Lead
                </dt>
                <dd className="mt-1 font-bold text-zinc-950">
                  {leadMetric?.value ?? "N/A"}
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  CI
                </dt>
                <dd className="mt-1 font-bold text-zinc-950">
                  {ciMetric?.value ?? "N/A"}
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Snapshot
                </dt>
                <dd className="mt-1 font-bold text-zinc-950">
                  {metricSnapshots.length}
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Queue
                </dt>
                <dd className="mt-1 font-bold text-zinc-950">
                  {pendingWork.length ? `${pendingWork.length}건` : "없음"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <OverviewMetricGroup
          title="Completion"
          value={`${donePhases.length}/${status.phases.length}`}
          summary="단계와 산출물 완료 기준"
          rows={[
            {
              label: "Deliverable",
              value: `${doneDeliverables.length}/${status.deliverables.length}`,
            },
            {
              label: "Feature",
              value: `${doneFeatures.length}/${status.features.length}`,
            },
            {
              label: "Approval",
              value: `${approvedCount}/${status.approvals.length}`,
            },
            {
              label: "Change",
              value: `${appliedChanges}/${status.planningChanges.length}`,
            },
          ]}
          variant="completion"
        />
        <OverviewMetricGroup
          title="Delivery Health"
          value={formatPercent(deliveryMetrics.traceCoverage)}
          summary="trace와 CI 기반 운영 건강도"
          rows={[
            { label: "Lead", value: leadMetric?.value ?? "N/A" },
            { label: "CI", value: ciMetric?.value ?? "N/A" },
            { label: "Ready", value: deliveryMetric?.value ?? "0" },
            { label: "Snapshot", value: metricSnapshots.length },
          ]}
          variant="delivery"
        />
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
            className={["rounded-lg px-4 py-2 text-sm font-semibold", QUIET_ACTION].join(" ")}
          >
            Gate 보기
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {status.phases.map((phase, index) => (
            <div key={phase.id} className="relative">
              <PhaseSignal phase={phase} isCurrent={phase.id === currentPhaseId} />
              {index < status.phases.length - 1 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-bold text-zinc-500 shadow-[0_1px_3px_rgba(0,0,0,0.04)] xl:flex"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="mt-4 h-6 rounded-b-2xl bg-gradient-to-b from-zinc-200/50 to-transparent"
        />
      </section>

      <section className={CARD_SURFACE}>
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
    <section className="rounded-2xl border border-zinc-200 bg-white">
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
          <Suspense fallback={<p className="text-sm text-zinc-500">문서 스타일 적용 중…</p>}>
            <MarkdownDocument content={document.content} />
          </Suspense>
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
                "block w-full px-4 py-4 text-left transition-colors duration-150",
                selectedPath === doc.path
                  ? "bg-zinc-950 text-white hover:bg-zinc-800"
                  : "bg-white hover:bg-zinc-50",
              ].join(" ")}
            >
              <p className={["font-semibold", selectedPath === doc.path ? "text-white" : "text-zinc-950"].join(" ")}>
                {doc.title}
              </p>
              <p
                className={[
                  "mt-1 text-sm leading-5",
                  selectedPath === doc.path ? "text-white/70" : "text-zinc-500",
                ].join(" ")}
              >
                {doc.summary}
              </p>
              <p
                className={[
                  "mt-2 truncate font-mono text-xs",
                  selectedPath === doc.path ? "text-white/60" : "text-zinc-400",
                ].join(" ")}
              >
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
  const viewerRef = useRef<HTMLDivElement>(null);
  const byPhase = deliverables.reduce<Record<string, ProcessDeliverable[]>>(
    (acc, deliverable) => {
      acc[deliverable.phase] ??= [];
      acc[deliverable.phase].push(deliverable);
      return acc;
    },
    {},
  );
  const openDocument = useCallback((docPath: string) => {
    setSelectedPath(docPath);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1279px)").matches) {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        viewerRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(440px,0.85fr)] xl:items-start">
      <div className="space-y-4">
        {Object.entries(byPhase).map(([phase, items]) => (
          <section key={phase} className="rounded-2xl border border-zinc-200 bg-white">
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
              {items.map((item) => {
                const isSelected = selectedPath === item.doc;
                return (
                  <li
                    key={item.id}
                    className={[
                      "grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[72px_1fr_90px_110px_90px] lg:items-center",
                      isSelected ? "bg-zinc-50" : "",
                    ].join(" ")}
                  >
                    <span className="font-mono text-xs font-semibold text-zinc-500">
                      {item.id}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-950">{item.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{item.summary}</p>
                      <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                        {item.doc}
                      </p>
                      <button
                        type="button"
                        onClick={() => openDocument(item.doc)}
                        aria-pressed={isSelected}
                        className={[
                          "mt-2 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors duration-150",
                          isSelected
                            ? "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950",
                        ].join(" ")}
                      >
                        {isSelected ? "열린 문서" : "문서 보기"}
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
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <div ref={viewerRef} className="scroll-mt-6 xl:sticky xl:top-6 xl:self-start">
        <DocumentViewer docPath={selectedPath} />
      </div>
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
            <div className="rounded-lg border border-zinc-100 bg-[#FAFAFA] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Approver
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {approval.approver}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-[#FAFAFA] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Contributors
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
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
              "rounded-lg border border-l-2 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
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
                    className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] font-semibold text-zinc-600"
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
    <article className={["p-5", CARD_SURFACE].join(" ")}>
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
        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
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
      <section className={["p-5", CARD_SURFACE].join(" ")}>
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
        <article className={CARD_SURFACE}>
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

        <article className={CARD_SURFACE}>
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

const PROCESS_RUN_LABEL: Record<ProcessRun["status"], string> = {
  active: "진행 중",
  blocked: "차단",
  completed: "완료",
  cancelled: "종료",
};

const PROCESS_GATE_LABEL: Record<ProcessGateDecision, string> = {
  pending: "결정 대기",
  go: "GO",
  hold: "HOLD",
  kill: "KILL",
};

const PROCESS_GATE_CLASS: Record<ProcessGateDecision, string> = {
  pending: "border-zinc-200 bg-zinc-50 text-zinc-600",
  go: "border-emerald-200 bg-emerald-50 text-emerald-700",
  hold: "border-amber-200 bg-amber-50 text-amber-700",
  kill: "border-rose-200 bg-rose-50 text-rose-700",
};

function WorkspaceTaskRow({
  run,
  stageId,
  task,
  disabled,
  onSaved,
}: {
  run: ProcessRun;
  stageId: string;
  task: ProcessRun["stages"][number]["tasks"][number];
  disabled: boolean;
  onSaved: (message: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await updateProcessTask(run.id, stageId, task.id, {
        status: String(form.get("status")) as ProcessItemStatus,
        assignee: String(form.get("assignee") ?? ""),
      });
      await onSaved(`${task.title} 작업이 갱신되었습니다.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "작업 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="grid gap-3 border-b border-zinc-100 px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_150px_160px_auto] lg:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <span className="font-mono text-[11px] text-zinc-400">{task.id}</span>
        </div>
        <h4 className="mt-2 font-bold text-zinc-950">{task.title}</h4>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{task.summary}</p>
      </div>
      <select
        name="status"
        defaultValue={task.status}
        disabled={disabled || saving}
        aria-label={`${task.title} 상태`}
        className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 disabled:bg-zinc-100 disabled:text-zinc-400"
      >
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>{STATUS_TITLE[status]}</option>
        ))}
      </select>
      <input
        name="assignee"
        defaultValue={task.assignee}
        disabled={disabled || saving}
        aria-label={`${task.title} 담당자`}
        placeholder="담당자"
        className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 placeholder:text-zinc-400 disabled:text-zinc-400"
      />
      <button
        type="submit"
        disabled={disabled || saving}
        className={["h-10 rounded-xl border px-4 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40", QUIET_ACTION].join(" ")}
      >
        {saving ? "저장 중" : "저장"}
      </button>
      {error ? <p className="text-xs text-rose-600 lg:col-span-4">{error}</p> : null}
    </form>
  );
}

interface BuilderTask {
  key: string;
  title: string;
  summary: string;
}

interface BuilderDeliverable extends BuilderTask {
  required: boolean;
}

interface BuilderStage {
  key: string;
  code: string;
  name: string;
  summary: string;
  tasks: BuilderTask[];
  deliverables: BuilderDeliverable[];
}

interface TemplateDraft {
  name: string;
  summary: string;
  stages: BuilderStage[];
}

let builderKeySequence = 0;
const nextBuilderKey = (prefix: string) => `${prefix}-${builderKeySequence += 1}`;

function newBuilderTask(): BuilderTask {
  return { key: nextBuilderKey("task"), title: "", summary: "" };
}

function newBuilderDeliverable(): BuilderDeliverable {
  return { key: nextBuilderKey("deliverable"), title: "", summary: "", required: true };
}

function newBuilderStage(position: number): BuilderStage {
  return {
    key: nextBuilderKey("stage"),
    code: `P${position}`,
    name: "",
    summary: "",
    tasks: [newBuilderTask()],
    deliverables: [newBuilderDeliverable()],
  };
}

function initialTemplateDraft(): TemplateDraft {
  return {
    name: "팀 맞춤 Delivery",
    summary: "우리 팀의 판단부터 배포까지 관리하는 프로세스",
    stages: [
      {
        ...newBuilderStage(0),
        name: "판단",
        summary: "문제와 진행 기준을 잠급니다.",
        tasks: [{ ...newBuilderTask(), title: "판단 근거 작성", summary: "고객, 문제와 성공 기준을 기록합니다." }],
        deliverables: [{ ...newBuilderDeliverable(), title: "Decision Brief", summary: "승인 가능한 판단 문서" }],
      },
    ],
  };
}

function draftFromTemplate(template: ProcessTemplate): TemplateDraft {
  return {
    name: `${template.name} Copy`,
    summary: template.summary,
    stages: template.stages.map((stage) => ({
      key: nextBuilderKey("stage"),
      code: stage.code,
      name: stage.name,
      summary: stage.summary,
      tasks: stage.tasks.map((task) => ({
        key: nextBuilderKey("task"),
        title: task.title,
        summary: task.summary,
      })),
      deliverables: stage.deliverables.map((deliverable) => ({
        key: nextBuilderKey("deliverable"),
        title: deliverable.title,
        summary: deliverable.summary,
        required: deliverable.required,
      })),
    })),
  };
}

function toTemplateRequest(draft: TemplateDraft): CreateProcessTemplateRequest {
  return {
    name: draft.name.trim(),
    summary: draft.summary.trim(),
    stages: draft.stages.map((stage) => ({
      code: stage.code.trim().toUpperCase(),
      name: stage.name.trim(),
      summary: stage.summary.trim(),
      tasks: stage.tasks.map(({ title, summary }) => ({ title: title.trim(), summary: summary.trim() })),
      deliverables: stage.deliverables.map(({ title, summary, required }) => ({ title: title.trim(), summary: summary.trim(), required })),
    })),
  };
}

function validateTemplateDraft(draft: TemplateDraft): string | null {
  if (!draft.name.trim() || !draft.summary.trim()) return "템플릿 이름과 설명을 입력하세요.";
  if (draft.stages.length === 0) return "Stage를 하나 이상 추가하세요.";
  const codes = draft.stages.map((stage) => stage.code.trim().toUpperCase());
  if (codes.some((code) => !/^[A-Z][A-Z0-9_-]{0,15}$/.test(code))) return "Stage 코드는 영문자로 시작하는 1–16자 코드여야 합니다.";
  if (new Set(codes).size !== codes.length) return "Stage 코드는 서로 달라야 합니다.";
  for (const stage of draft.stages) {
    if (!stage.name.trim() || !stage.summary.trim()) return `${stage.code || "Stage"}의 이름과 설명을 입력하세요.`;
    if (stage.tasks.length === 0) return `${stage.code}에 Task를 하나 이상 추가하세요.`;
    if (stage.tasks.some((task) => !task.title.trim() || !task.summary.trim())) return `${stage.code}의 모든 Task 제목과 설명을 입력하세요.`;
    if (stage.deliverables.some((item) => !item.title.trim() || !item.summary.trim())) return `${stage.code}의 모든 산출물 제목과 설명을 입력하세요.`;
  }
  return null;
}

function TemplateStageEditor({
  stage,
  position,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  stage: BuilderStage;
  position: number;
  total: number;
  onChange: (stage: BuilderStage) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const updateTask = (key: string, change: Partial<BuilderTask>) => {
    onChange({ ...stage, tasks: stage.tasks.map((task) => task.key === key ? { ...task, ...change } : task) });
  };
  const updateDeliverable = (key: string, change: Partial<BuilderDeliverable>) => {
    onChange({ ...stage, deliverables: stage.deliverables.map((item) => item.key === key ? { ...item, ...change } : item) });
  };

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 font-mono text-xs font-bold text-white">{position + 1}</span>
          <div><p className="text-xs font-bold text-zinc-950">{stage.name || "이름 없는 Stage"}</p><p className="mt-0.5 font-mono text-[10px] text-violet-700">{stage.code || "CODE"}</p></div>
        </div>
        <div className="flex gap-1">
          <button type="button" aria-label={`${stage.code} 위로 이동`} disabled={position === 0} onClick={() => onMove(-1)} className={["h-8 rounded-lg border px-2.5 text-xs font-bold disabled:opacity-30", QUIET_ACTION].join(" ")}>↑</button>
          <button type="button" aria-label={`${stage.code} 아래로 이동`} disabled={position === total - 1} onClick={() => onMove(1)} className={["h-8 rounded-lg border px-2.5 text-xs font-bold disabled:opacity-30", QUIET_ACTION].join(" ")}>↓</button>
          <button type="button" disabled={total === 1} onClick={onRemove} className="h-8 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-30">삭제</button>
        </div>
      </header>
      <div className="space-y-5 p-4">
        <div className="grid gap-3 md:grid-cols-[120px_1fr]">
          <label className="text-xs font-bold text-zinc-600">Stage 코드<input value={stage.code} onChange={(event) => onChange({ ...stage, code: event.target.value.toUpperCase() })} maxLength={16} className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-mono text-xs uppercase" /></label>
          <label className="text-xs font-bold text-zinc-600">Stage 이름<input value={stage.name} onChange={(event) => onChange({ ...stage, name: event.target.value })} maxLength={80} className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm" /></label>
        </div>
        <label className="block text-xs font-bold text-zinc-600">Stage 설명<textarea value={stage.summary} onChange={(event) => onChange({ ...stage, summary: event.target.value })} rows={2} maxLength={240} className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-6" /></label>

        <div>
          <div className="flex items-center justify-between gap-3"><div><p className={META_LABEL}>Tasks</p><p className="mt-1 text-xs text-zinc-500">GO 전에 완료할 실행 항목</p></div><button type="button" disabled={stage.tasks.length >= 50} onClick={() => onChange({ ...stage, tasks: [...stage.tasks, newBuilderTask()] })} className={["rounded-lg border px-3 py-2 text-xs font-bold", QUIET_ACTION].join(" ")}>+ Task</button></div>
          <div className="mt-3 space-y-2">
            {stage.tasks.map((task, index) => <div key={task.key} className="grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[28px_1fr_1.4fr_auto] md:items-center"><span className="font-mono text-xs font-bold text-zinc-400">T{index + 1}</span><input aria-label={`${stage.code} Task ${index + 1} 제목`} value={task.title} onChange={(event) => updateTask(task.key, { title: event.target.value })} maxLength={120} placeholder="Task 제목" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`${stage.code} Task ${index + 1} 설명`} value={task.summary} onChange={(event) => updateTask(task.key, { summary: event.target.value })} maxLength={240} placeholder="완료 기준과 설명" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><button type="button" aria-label={`${stage.code} Task ${index + 1} 삭제`} disabled={stage.tasks.length === 1} onClick={() => onChange({ ...stage, tasks: stage.tasks.filter((item) => item.key !== task.key) })} className="h-9 rounded-lg px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-25">삭제</button></div>)}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3"><div><p className={META_LABEL}>Deliverables</p><p className="mt-1 text-xs text-zinc-500">Gate에서 제출·승인할 산출물</p></div><button type="button" disabled={stage.deliverables.length >= 20} onClick={() => onChange({ ...stage, deliverables: [...stage.deliverables, newBuilderDeliverable()] })} className={["rounded-lg border px-3 py-2 text-xs font-bold", QUIET_ACTION].join(" ")}>+ 산출물</button></div>
          <div className="mt-3 space-y-2">
            {stage.deliverables.map((item, index) => <div key={item.key} className="grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[28px_1fr_1.4fr_auto_auto] md:items-center"><span className="font-mono text-xs font-bold text-zinc-400">D{index + 1}</span><input aria-label={`${stage.code} 산출물 ${index + 1} 제목`} value={item.title} onChange={(event) => updateDeliverable(item.key, { title: event.target.value })} maxLength={120} placeholder="산출물 제목" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`${stage.code} 산출물 ${index + 1} 설명`} value={item.summary} onChange={(event) => updateDeliverable(item.key, { summary: event.target.value })} maxLength={240} placeholder="승인 기준과 설명" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><label className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-zinc-600"><input type="checkbox" checked={item.required} onChange={(event) => updateDeliverable(item.key, { required: event.target.checked })} className="h-4 w-4 accent-violet-600" />필수</label><button type="button" aria-label={`${stage.code} 산출물 ${index + 1} 삭제`} onClick={() => onChange({ ...stage, deliverables: stage.deliverables.filter((deliverable) => deliverable.key !== item.key) })} className="h-9 rounded-lg px-2 text-xs font-bold text-rose-600 hover:bg-rose-50">삭제</button></div>)}
            {stage.deliverables.length === 0 ? <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-5 text-center text-xs text-zinc-500">산출물 없이 Task 완료만으로 Gate를 운영합니다.</p> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function TemplateCatalog({
  workspace,
  onRefresh,
}: {
  workspace: ProcessWorkspaceOverview;
  onRefresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TemplateDraft>(() => initialTemplateDraft());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const validationMessage = validateTemplateDraft(draft);
      if (validationMessage) throw new Error(validationMessage);
      const template = await createProcessTemplate(toTemplateRequest(draft));
      await onRefresh();
      setMessage(`${template.name} 템플릿을 저장했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "템플릿 생성 실패");
    } finally {
      setSaving(false);
    }
  };

  const startNew = () => {
    setDraft(initialTemplateDraft());
    setMessage(null);
    setOpen(true);
  };

  const cloneTemplate = (template: ProcessTemplate) => {
    setDraft(draftFromTemplate(template));
    setMessage(`${template.name}을 복제했습니다. 이름과 단계를 편집해 저장하세요.`);
    setOpen(true);
  };

  const updateStage = (key: string, nextStage: BuilderStage) => {
    setDraft((current) => ({ ...current, stages: current.stages.map((stage) => stage.key === key ? nextStage : stage) }));
  };

  const moveStage = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.stages.length) return current;
      const stages = [...current.stages];
      [stages[index], stages[target]] = [stages[target]!, stages[index]!];
      return { ...current, stages };
    });
  };

  const taskCount = draft.stages.reduce((sum, stage) => sum + stage.tasks.length, 0);
  const deliverableCount = draft.stages.reduce((sum, stage) => sum + stage.deliverables.length, 0);
  const requiredCount = draft.stages.reduce((sum, stage) => sum + stage.deliverables.filter((item) => item.required).length, 0);
  const validationMessage = validateTemplateDraft(draft);

  return (
    <section className={CARD_SURFACE}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <p className={META_LABEL}>Template catalog</p>
          <h3 className="mt-1 text-lg font-bold text-zinc-950">실행 가능한 프로세스 템플릿</h3>
        </div>
        <button type="button" onClick={open ? () => setOpen(false) : startNew} className={["rounded-xl border px-4 py-2 text-xs font-bold", QUIET_ACTION].join(" ")}>
          {open ? "Builder 닫기" : "새 템플릿 만들기"}
        </button>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {workspace.templates.map((template) => (
          <article key={template.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-bold text-zinc-950">{template.name}</h4>
              <span className="whitespace-nowrap font-mono text-[11px] text-violet-700">{template.stages.length} stages</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{template.summary}</p>
            <div className="mt-3 flex items-center justify-between gap-3"><p className="truncate font-mono text-[10px] text-zinc-400">{template.id}</p><button type="button" onClick={() => cloneTemplate(template)} className="whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-bold text-violet-700 hover:bg-violet-50">복제 편집</button></div>
          </article>
        ))}
      </div>
      {open ? (
        <form onSubmit={(event) => void handleCreate(event)} className="border-t border-zinc-100 bg-zinc-50/70 p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <p className={META_LABEL}>Template identity</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold text-zinc-600">템플릿 이름<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} maxLength={80} className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm" /></label><label className="text-xs font-bold text-zinc-600">템플릿 설명<input value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} maxLength={240} className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm" /></label></div>
              </section>
              {draft.stages.map((stage, index) => <TemplateStageEditor key={stage.key} stage={stage} position={index} total={draft.stages.length} onChange={(nextStage) => updateStage(stage.key, nextStage)} onMove={(direction) => moveStage(index, direction)} onRemove={() => setDraft((current) => ({ ...current, stages: current.stages.filter((item) => item.key !== stage.key) }))} />)}
              <button type="button" disabled={draft.stages.length >= 20} onClick={() => setDraft((current) => ({ ...current, stages: [...current.stages, newBuilderStage(current.stages.length)] }))} className="w-full rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm font-bold text-zinc-700 hover:border-violet-300 hover:text-violet-700 disabled:opacity-40">+ Stage 추가</button>
            </div>
            <aside className="h-fit rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-white xl:sticky xl:top-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Live blueprint</p><h4 className="mt-2 text-lg font-bold">{draft.name || "새 프로세스"}</h4><p className="mt-2 text-xs leading-5 text-zinc-400">{draft.summary || "템플릿 설명을 입력하세요."}</p>
              <dl className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/10 p-3"><dt className="text-[10px] text-zinc-400">STAGE</dt><dd className="mt-1 font-mono text-lg font-bold">{draft.stages.length}</dd></div><div className="rounded-xl bg-white/10 p-3"><dt className="text-[10px] text-zinc-400">TASK</dt><dd className="mt-1 font-mono text-lg font-bold">{taskCount}</dd></div><div className="rounded-xl bg-white/10 p-3"><dt className="text-[10px] text-zinc-400">REQUIRED</dt><dd className="mt-1 font-mono text-lg font-bold">{requiredCount}</dd></div></dl>
              <ol className="mt-5 space-y-2">{draft.stages.map((stage, index) => <li key={stage.key} className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2"><span className="font-mono text-[10px] font-bold text-violet-300">{stage.code || `S${index + 1}`}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold">{stage.name || "이름 없는 Stage"}</span><span className="font-mono text-[10px] text-zinc-500">{stage.tasks.length}T · {stage.deliverables.length}D</span></li>)}</ol>
              <div className="mt-5 border-t border-white/10 pt-4"><p className={["text-xs leading-5", validationMessage ? "text-amber-300" : "text-emerald-300"].join(" ")}>{validationMessage ?? `${deliverableCount}개 산출물과 ${taskCount}개 Task가 저장 준비되었습니다.`}</p><button type="submit" disabled={saving || Boolean(validationMessage)} className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-35">{saving ? "저장 중…" : "Catalog에 저장"}</button><p className="mt-3 text-center text-[10px] leading-4 text-zinc-500">저장 즉시 프로젝트 생성에 사용할 수 있습니다.</p></div>
            </aside>
          </div>
          {message ? <p className="mt-3 rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-700">{message}</p> : null}
        </form>
      ) : null}
    </section>
  );
}

function WorkspaceDeliverableRow({
  run,
  stageId,
  deliverable,
  disabled,
  onSaved,
}: {
  run: ProcessRun;
  stageId: string;
  deliverable: ProcessDeliverableRun;
  disabled: boolean;
  onSaved: (message: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await updateProcessDeliverable(run.id, stageId, deliverable.id, {
        status: String(form.get("status")) as ProcessDeliverableRun["status"],
        owner: String(form.get("owner") ?? ""),
        uri: String(form.get("uri") ?? ""),
        note: String(form.get("note") ?? ""),
      });
      await onSaved(`${deliverable.title} 산출물을 저장했습니다.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "산출물 저장 실패");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="border-t border-zinc-100 px-5 py-4 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-sm text-zinc-950">{deliverable.title}</strong>
        {deliverable.required ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">필수</span> : null}
      </div>
      <p className="mt-1 text-xs text-zinc-500">{deliverable.summary}</p>
      <div className="mt-3 grid gap-2 lg:grid-cols-[150px_160px_minmax(200px,1fr)_auto]">
        <select name="status" defaultValue={deliverable.status} disabled={disabled || saving} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs">
          <option value="pending">대기</option><option value="submitted">제출</option><option value="approved">승인</option><option value="changes_requested">수정 요청</option>
        </select>
        <input name="owner" defaultValue={deliverable.owner} disabled={disabled || saving} placeholder="Owner" className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs" />
        <input name="uri" defaultValue={deliverable.uri} disabled={disabled || saving} placeholder="docs/... 또는 https://..." className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs" />
        <button type="submit" disabled={disabled || saving} className={["h-10 rounded-xl border px-4 text-xs font-bold disabled:opacity-40", QUIET_ACTION].join(" ")}>{saving ? "저장 중" : "저장"}</button>
      </div>
      <input name="note" defaultValue={deliverable.note} disabled={disabled || saving} placeholder="검토 메모 (선택)" className="mt-2 h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs" />
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </form>
  );
}

function WorkspaceSection({
  workspace,
  onRefresh,
}: {
  workspace: ProcessWorkspaceOverview;
  onRefresh: () => Promise<void>;
}) {
  const [selectedRunId, setSelectedRunId] = useState("");
  const [selectedStageId, setSelectedStageId] = useState("");
  const [gateNote, setGateNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const projectsById = useMemo(
    () => new Map(workspace.projects.map((project) => [project.id, project])),
    [workspace.projects],
  );
  const selectedRun =
    workspace.runs.find((run) => run.id === selectedRunId) ?? workspace.runs[0] ?? null;
  const selectedProject = selectedRun ? projectsById.get(selectedRun.projectId) : null;
  const selectedBrief = selectedProject
    ? workspace.briefs.find((brief) => brief.projectId === selectedProject.id) ?? null
    : null;
  const selectedDesignPack = selectedProject
    ? workspace.designPacks.find((designPack) => designPack.projectId === selectedProject.id) ?? null
    : null;
  const selectedStage = selectedRun
    ? selectedRun.stages.find((stage) => stage.id === selectedStageId) ??
      selectedRun.stages.find((stage) => stage.id === selectedRun.currentStageId) ??
      selectedRun.stages[0]
    : null;
  const runIsTerminal = selectedRun
    ? selectedRun.status === "completed" || selectedRun.status === "cancelled"
    : false;

  const refreshWithMessage = async (nextMessage: string) => {
    await onRefresh();
    setMessage(nextMessage);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSubmitting(true);
    setMessage(null);
    try {
      const created = await createProcessProject({
        name: String(form.get("name") ?? ""),
        summary: String(form.get("summary") ?? ""),
        owner: String(form.get("owner") ?? ""),
        templateId: String(form.get("templateId") ?? ""),
      });
      setSelectedRunId(created.run.id);
      setSelectedStageId(created.run.currentStageId ?? "");
      formElement.reset();
      await refreshWithMessage(`${created.project.name} 프로젝트가 시작되었습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "프로젝트 생성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStageStatus = async (status: "in_progress" | "blocked") => {
    if (!selectedRun || !selectedStage) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await updateProcessStage(selectedRun.id, selectedStage.id, { status });
      await refreshWithMessage(
        status === "blocked" ? `${selectedStage.name} 단계를 차단했습니다.` : `${selectedStage.name} 단계를 시작했습니다.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "단계 변경 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGateDecision = async (decision: "go" | "hold" | "kill") => {
    if (!selectedRun || !selectedStage) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const run = await decideProcessGate(selectedRun.id, selectedStage.id, {
        decision,
        note: gateNote,
      });
      setSelectedStageId(run.currentStageId ?? selectedStage.id);
      setGateNote("");
      await refreshWithMessage(`${selectedStage.name} Gate가 ${decision.toUpperCase()}로 기록되었습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gate 결정 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRun || !selectedStage) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSubmitting(true);
    setMessage(null);
    try {
      await createProcessEvidence(selectedRun.id, selectedStage.id, {
        type: String(form.get("type")) as Parameters<typeof createProcessEvidence>[2]["type"],
        label: String(form.get("label") ?? ""),
        url: String(form.get("url") ?? ""),
        summary: String(form.get("summary") ?? ""),
      });
      formElement.reset();
      await refreshWithMessage("검증 증거를 제출했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "증거 제출 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const completedTasks = selectedRun
    ? selectedRun.stages.flatMap((stage) => stage.tasks).filter((task) => task.status === "done").length
    : 0;
  const totalTasks = selectedRun
    ? selectedRun.stages.reduce((sum, stage) => sum + stage.tasks.length, 0)
    : 0;
  const allStageTasksDone = selectedStage?.tasks.every((task) => task.status === "done") ?? false;
  const requiredDeliverablesApproved = selectedStage?.deliverables
    .filter((deliverable) => deliverable.required)
    .every((deliverable) => deliverable.status === "approved") ?? false;

  return (
    <div className="space-y-6">
      <TemplateCatalog workspace={workspace} onRefresh={onRefresh} />

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Projects" value={workspace.projects.length} tone="violet" />
        <Metric label="Active runs" value={workspace.runs.filter((run) => run.status === "active").length} tone="green" />
        <Metric label="Decision queue" value={workspace.runs.flatMap((run) => run.stages).filter((stage) => stage.status === "in_progress" && stage.gate.decision === "pending").length} tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <form onSubmit={(event) => void handleCreate(event)} className={["p-5", CARD_SURFACE].join(" ")}>
            <p className={META_LABEL}>New process run</p>
            <h3 className="mt-2 text-lg font-bold text-zinc-950">프로젝트 시작</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">템플릿을 선택하면 단계와 작업이 실행 가능한 상태로 복제됩니다.</p>
            <label className="mt-4 block text-xs font-semibold text-zinc-600" htmlFor="project-name">프로젝트명</label>
            <input id="project-name" name="name" required className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm" placeholder="예: 신규 B2B 포털" />
            <label className="mt-3 block text-xs font-semibold text-zinc-600" htmlFor="project-summary">목표</label>
            <textarea id="project-summary" name="summary" required rows={3} className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-6" placeholder="해결할 문제와 기대 결과" />
            <label className="mt-3 block text-xs font-semibold text-zinc-600" htmlFor="project-owner">Owner</label>
            <input id="project-owner" name="owner" required className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm" placeholder="팀 또는 담당자" />
            <label className="mt-3 block text-xs font-semibold text-zinc-600" htmlFor="process-template">프로세스 템플릿</label>
            <select id="process-template" name="templateId" required className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              {workspace.templates.map((template) => (
                <option key={template.id} value={template.id}>{template.name} · v{template.version}</option>
              ))}
            </select>
            <button type="submit" disabled={submitting || workspace.templates.length === 0} className="mt-4 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-40">
              {submitting ? "처리 중…" : "프로젝트 시작"}
            </button>
          </form>

          <div className={CARD_SURFACE}>
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className={META_LABEL}>Project portfolio</p>
              <h3 className="mt-1 font-bold text-zinc-950">실행 목록</h3>
            </div>
            {workspace.runs.length ? (
              <div className="p-2">
                {workspace.runs.map((run) => {
                  const project = projectsById.get(run.projectId);
                  const isActive = run.id === selectedRun?.id;
                  return (
                    <button
                      key={run.id}
                      type="button"
                      onClick={() => {
                        setSelectedRunId(run.id);
                        setSelectedStageId(run.currentStageId ?? run.stages[0]?.id ?? "");
                      }}
                      className={["mb-2 w-full rounded-xl border px-3 py-3 text-left last:mb-0", isActive ? "border-violet-300 bg-violet-50/50" : "border-transparent hover:bg-zinc-100"].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-zinc-950">{project?.name}</span>
                        <span className="text-xs font-semibold text-zinc-500">{PROCESS_RUN_LABEL[run.status]}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-zinc-500">{project?.owner} · {run.stages.find((stage) => stage.id === run.currentStageId)?.name ?? "종료"}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">첫 프로젝트를 시작하세요.</p>
            )}
          </div>
        </div>

        {selectedRun && selectedProject && selectedStage && selectedBrief && selectedDesignPack ? (
          <div className="space-y-4">
            <section className={["p-5", CARD_SURFACE].join(" ")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-violet-700">{selectedRun.id}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">{selectedProject.name}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{selectedProject.summary}</p>
                </div>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-700">{PROCESS_RUN_LABEL[selectedRun.status]}</span>
              </div>
              <div className="mt-5 grid gap-2 md:grid-cols-5">
                {selectedRun.stages.map((stage, index) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedStageId(stage.id)}
                    className={["rounded-xl border px-3 py-3 text-left transition", stage.id === selectedStage.id ? "border-violet-400 bg-white shadow-sm" : stage.status === "done" ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"].join(" ")}
                  >
                    <span className="font-mono text-[11px] font-bold text-zinc-400">P{index}</span>
                    <span className="mt-1 block text-sm font-bold text-zinc-900">{stage.name}</span>
                    <span className="mt-1 block text-[11px] text-zinc-500">{STATUS_TITLE[stage.status]}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
                <span>Owner · <strong className="text-zinc-800">{selectedProject.owner}</strong></span>
                <span>Task progress · <strong className="text-zinc-800">{completedTasks}/{totalTasks}</strong></span>
              </div>
            </section>

            <ProjectWorkbench
              key={`${selectedProject.id}-${selectedBrief.updatedAt}-${selectedDesignPack.updatedAt}`}
              project={selectedProject}
              brief={selectedBrief}
              designPack={selectedDesignPack}
              onRefresh={onRefresh}
            />

            <section className={CARD_SURFACE}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selectedStage.status} />
                    <span className={["rounded-full border px-2.5 py-0.5 text-xs font-semibold", PROCESS_GATE_CLASS[selectedStage.gate.decision]].join(" ")}>{PROCESS_GATE_LABEL[selectedStage.gate.decision]}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-zinc-950">{selectedStage.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">{selectedStage.summary}</p>
                </div>
                {!runIsTerminal && selectedStage.status !== "done" ? (
                  <div className="flex gap-2">
                    <button type="button" disabled={submitting} onClick={() => void handleStageStatus("in_progress")} className={["rounded-lg border px-3 py-2 text-xs font-bold", QUIET_ACTION].join(" ")}>단계 시작</button>
                    <button type="button" disabled={submitting} onClick={() => void handleStageStatus("blocked")} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">차단</button>
                  </div>
                ) : null}
              </div>
              <div>
                {selectedStage.tasks.map((task) => (
                  <WorkspaceTaskRow
                    key={`${task.id}-${task.updatedAt}`}
                    run={selectedRun}
                    stageId={selectedStage.id}
                    task={task}
                    disabled={runIsTerminal || selectedStage.status === "done"}
                    onSaved={refreshWithMessage}
                  />
                ))}
              </div>
            </section>

            <section className={CARD_SURFACE}>
              <div className="border-b border-zinc-100 px-5 py-4">
                <p className={META_LABEL}>Deliverable command</p>
                <h3 className="mt-1 text-lg font-bold text-zinc-950">산출물 제출과 승인</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">필수 산출물은 URI와 Owner를 제출하고 승인되어야 GO할 수 있습니다.</p>
              </div>
              {selectedStage.deliverables.length ? selectedStage.deliverables.map((deliverable) => (
                <WorkspaceDeliverableRow
                  key={`${deliverable.id}-${deliverable.updatedAt}`}
                  run={selectedRun}
                  stageId={selectedStage.id}
                  deliverable={deliverable}
                  disabled={runIsTerminal || selectedStage.status === "done"}
                  onSaved={refreshWithMessage}
                />
              )) : <p className="px-5 py-6 text-sm text-zinc-500">이 단계에 정의된 산출물이 없습니다.</p>}
            </section>

            <section className={CARD_SURFACE}>
              <div className="border-b border-zinc-100 px-5 py-4">
                <p className={META_LABEL}>Evidence command</p>
                <h3 className="mt-1 text-lg font-bold text-zinc-950">검증 증거 연결</h3>
              </div>
              <form onSubmit={(event) => void handleEvidence(event)} className="grid gap-2 p-5 lg:grid-cols-[130px_180px_minmax(200px,1fr)_auto]">
                <select name="type" aria-label="증거 유형" disabled={submitting || runIsTerminal} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs"><option value="document">문서</option><option value="issue">Issue</option><option value="pr">PR</option><option value="commit">Commit</option><option value="ci">CI</option><option value="release">Release</option><option value="link">Link</option></select>
                <input name="label" required disabled={submitting || runIsTerminal} placeholder="증거 이름" className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs" />
                <input name="url" required disabled={submitting || runIsTerminal} placeholder="URL 또는 docs/... 경로" className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs" />
                <button type="submit" disabled={submitting || runIsTerminal} className="h-10 rounded-xl bg-zinc-950 px-4 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40">증거 제출</button>
                <input name="summary" required disabled={submitting || runIsTerminal} placeholder="이 증거가 검증하는 내용" className="h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs lg:col-span-4" />
              </form>
              {selectedStage.evidence.length ? (
                <ul className="border-t border-zinc-100 px-5 py-3">
                  {selectedStage.evidence.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 py-3 text-xs last:border-b-0"><span><strong className="uppercase text-violet-700">{item.type}</strong> · {item.label}<span className="ml-2 text-zinc-400">{item.summary}</span></span><a href={item.url} target="_blank" rel="noreferrer" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-4">열기</a></li>)}
                </ul>
              ) : null}
            </section>

            <section className={["p-5", CARD_SURFACE].join(" ")}>
              <p className={META_LABEL}>Decision gate</p>
              <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">GO / HOLD / KILL</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">GO는 모든 작업 완료와 필수 산출물 승인을 확인한 뒤 다음 단계를 자동 시작합니다. HOLD와 KILL은 사유가 필요합니다.</p>
                  <textarea value={gateNote} onChange={(event) => setGateNote(event.target.value)} disabled={runIsTerminal || selectedStage.status === "done"} rows={2} className="mt-3 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-6" placeholder="결정 근거 또는 보완 조건" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={submitting || runIsTerminal || selectedStage.status === "done" || !allStageTasksDone || !requiredDeliverablesApproved} onClick={() => void handleGateDecision("go")} className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-35">GO</button>
                  <button type="button" disabled={submitting || runIsTerminal || selectedStage.status === "done"} onClick={() => void handleGateDecision("hold")} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-35">HOLD</button>
                  <button type="button" disabled={submitting || runIsTerminal || selectedStage.status === "done"} onClick={() => void handleGateDecision("kill")} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-35">KILL</button>
                </div>
              </div>
              {message ? <p className="mt-3 rounded-lg bg-zinc-100 px-3 py-2 text-xs leading-5 text-zinc-700">{message}</p> : null}
            </section>
          </div>
        ) : (
          <section className={["flex min-h-[420px] items-center justify-center p-8 text-center", CARD_SURFACE].join(" ")}>
            <div>
              <p className="text-lg font-bold text-zinc-900">실행 중인 프로젝트가 없습니다.</p>
              <p className="mt-2 text-sm text-zinc-500">왼쪽에서 템플릿을 선택해 첫 프로세스를 시작하세요.</p>
            </div>
          </section>
        )}
      </section>

      {workspace.auditEvents.length ? (
        <section className={CARD_SURFACE}>
          <div className="border-b border-zinc-100 px-5 py-4">
            <p className={META_LABEL}>Append-only activity</p>
            <h3 className="mt-1 font-bold text-zinc-950">최근 실행 이력</h3>
          </div>
          <ul className="grid gap-px bg-zinc-100 md:grid-cols-2">
            {workspace.auditEvents.slice(0, 8).map((event) => (
              <li key={event.id} className="bg-white px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700">{event.entityType} · {event.action}</span>
                  <span className="font-mono text-[11px] text-zinc-400">{formatTimestamp(event.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-700">{event.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

const INCIDENT_SEVERITY_LABEL: Record<ProcessIncidentSeverity, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  critical: "심각",
};

const INCIDENT_SEVERITY_CLASS: Record<ProcessIncidentSeverity, string> = {
  low: "border-sky-200 bg-sky-50 text-sky-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  critical: "border-rose-200 bg-rose-50 text-rose-700",
};

function OperationsSection({
  operations,
  onRefresh,
}: {
  operations: ProcessOperationsOverview;
  onRefresh: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [severity, setSeverity] = useState<ProcessIncidentSeverity>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await createProcessIncident({ title, summary, severity });
      setTitle("");
      setSummary("");
      setSeverity("medium");
      await onRefresh();
      setMessage("Incident가 SQLite에 기록되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Incident 기록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await resolveProcessIncident(id);
      await onRefresh();
      setMessage(`${id}가 해결 상태로 변경되었습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Incident 해결 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Open incidents" value={operations.incidents.open} tone={operations.incidents.open ? "amber" : "green"} />
        <Metric
          label="MTTR"
          value={
            operations.incidents.mttrHours === null
              ? "N/A"
              : `${operations.incidents.mttrHours.toFixed(1)}h`
          }
          tone="violet"
        />
        <Metric label="Indexed docs" value={operations.documents.indexed} tone="neutral" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={(event) => void handleSubmit(event)} className={["p-5", CARD_SURFACE].join(" ")}>
          <p className={META_LABEL}>Local operations store</p>
          <h3 className="mt-2 text-lg font-bold text-zinc-950">Incident 기록</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            문서 SSOT는 유지하고 운영 사건과 복구 시간만 SQLite에 기록합니다.
          </p>

          <label className="mt-5 block text-xs font-semibold text-zinc-600" htmlFor="incident-title">
            제목
          </label>
          <input
            id="incident-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-zinc-950 focus:bg-white"
            placeholder="예: 배포 smoke 실패"
          />

          <label className="mt-4 block text-xs font-semibold text-zinc-600" htmlFor="incident-summary">
            요약
          </label>
          <textarea
            id="incident-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            required
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm leading-6 outline-none focus:border-zinc-950 focus:bg-white"
            placeholder="영향과 확인할 내용을 기록하세요."
          />

          <label className="mt-4 block text-xs font-semibold text-zinc-600" htmlFor="incident-severity">
            심각도
          </label>
          <select
            id="incident-severity"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as ProcessIncidentSeverity)}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-950"
          >
            {Object.entries(INCIDENT_SEVERITY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "저장 중…" : "Incident 저장"}
          </button>
          {message ? <p className="mt-3 text-xs leading-5 text-zinc-600">{message}</p> : null}
        </form>

        <div className={CARD_SURFACE}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
            <div>
              <p className={META_LABEL}>SQLite · schema v{operations.storage.schemaVersion}</p>
              <h3 className="mt-1 font-bold text-zinc-950">Incident timeline</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
              {operations.storage.durability}
            </span>
          </div>
          {operations.incidents.items.length ? (
            <ul>
              {operations.incidents.items.map((incident) => (
                <li key={incident.id} className="border-b border-zinc-100 px-5 py-4 last:border-b-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={["rounded-full border px-2.5 py-0.5 text-xs font-semibold", INCIDENT_SEVERITY_CLASS[incident.severity]].join(" ")}>
                          {INCIDENT_SEVERITY_LABEL[incident.severity]}
                        </span>
                        <span className="font-mono text-xs text-zinc-400">{incident.id}</span>
                      </div>
                      <h4 className="mt-2 font-bold text-zinc-950">{incident.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">{incident.summary}</p>
                      <p className="mt-2 font-mono text-xs text-zinc-400">{formatTimestamp(incident.occurredAt)}</p>
                    </div>
                    {incident.status === "open" ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleResolve(incident.id)}
                        className={["rounded-lg px-3 py-2 text-xs font-bold", QUIET_ACTION].join(" ")}
                      >
                        해결 처리
                      </button>
                    ) : (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        해결됨
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-semibold text-zinc-800">기록된 Incident가 없습니다.</p>
              <p className="mt-2 text-sm text-zinc-500">운영 상태가 깨끗합니다.</p>
            </div>
          )}
        </div>
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
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
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
  const [operations, setOperations] = useState<ProcessOperationsOverview | null>(null);
  const [workspace, setWorkspace] = useState<ProcessWorkspaceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  const load = useCallback(async () => {
    setError(null);
    try {
      const [data, snapshots, operationsData, workspaceData] = await Promise.all([
        fetchProcessStatus(),
        fetchProcessMetricSnapshots(),
        fetchProcessOperations(),
        fetchProcessWorkspace(),
      ]);
      setStatus(data);
      setMetricSnapshots(snapshots.snapshots);
      setOperations(operationsData);
      setWorkspace(workspaceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOperations = useCallback(async () => {
    setOperations(await fetchProcessOperations());
  }, []);

  const refreshWorkspace = useCallback(async () => {
    setWorkspace(await fetchProcessWorkspace());
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

  if (error || !status || !workspace) {
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
  const active = SECTION_MAP.get(activeSection);

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-zinc-950 lg:flex">
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        status={status}
      />

      <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">
        <header className={["mb-6 px-5 py-4", CARD_SURFACE].join(" ")}>
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
                className={["rounded-lg px-4 py-2 text-sm font-semibold", QUIET_ACTION].join(" ")}
              >
                새로고침
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 border-t border-zinc-100 pt-4 text-xs md:grid-cols-[1.1fr_1fr_1.2fr_auto] md:items-end">
            <div className="border-l-2 border-zinc-950 pl-3">
              <p className="font-semibold uppercase tracking-wider text-zinc-400">
                Sprint
              </p>
              <p className="mt-1 text-sm font-extrabold text-zinc-950">{status.sprint.id}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-zinc-400">
                Version
              </p>
              <p className="mt-1 font-mono font-bold text-zinc-800">{status.systemVersion}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-zinc-400">
                Updated
              </p>
              <p className="mt-1 font-mono font-medium text-zinc-500">
                {status.updatedAt}
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wider text-zinc-400">
                Section
              </p>
              <p className="inline-flex rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 font-bold text-zinc-800">
                {active?.label}
              </p>
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

        {activeSection === "workspace" && (
          <WorkspaceSection workspace={workspace} onRefresh={refreshWorkspace} />
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

        {activeSection === "operations" && operations && (
          <OperationsSection
            operations={operations}
            onRefresh={refreshOperations}
          />
        )}

        {activeSection === "apps" && <AppsSection apps={status.apps} />}
      </main>
    </div>
  );
}
