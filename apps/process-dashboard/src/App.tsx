import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ProcessApp,
  ProcessApproval,
  ProcessCheckItem,
  ProcessDeliverable,
  ProcessDeliverableType,
  ProcessIntake,
  ProcessItemStatus,
  ProcessPhase,
  ProcessPlanningChange,
  ProcessPlanningChangeStatus,
  ProcessStatus,
  ProcessTraceLink,
  ProcessTraceReferenceStatus,
  ProcessTraceStatus,
} from "@goodz/types";
import { fetchProcessStatus } from "./api/process";
import { PhasePanel } from "./components/PhasePanel";
import { ProgressBar, StatusBadge } from "./components/StatusBadge";

type SectionId =
  | "overview"
  | "intakes"
  | "changes"
  | "deliverables"
  | "approvals"
  | "traceability"
  | "phases"
  | "queue"
  | "features"
  | "apps";

const SECTIONS: Array<{ id: SectionId; label: string; eyebrow: string }> = [
  { id: "overview", label: "개요", eyebrow: "Overview" },
  { id: "intakes", label: "기획", eyebrow: "Intake" },
  { id: "changes", label: "변경", eyebrow: "Change" },
  { id: "deliverables", label: "산출물", eyebrow: "Docs" },
  { id: "approvals", label: "승인", eyebrow: "Approval" },
  { id: "traceability", label: "추적", eyebrow: "Trace" },
  { id: "phases", label: "Phase Gate", eyebrow: "P0-P4" },
  { id: "queue", label: "작업 큐", eyebrow: "Tasks" },
  { id: "features", label: "기능", eyebrow: "Backlog" },
  { id: "apps", label: "앱", eyebrow: "Services" },
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
}: {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
  status: ProcessStatus;
  overallProgress: number;
}) {
  return (
    <aside className="border-b border-zinc-200 bg-white px-5 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
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

      <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
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

      <nav className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1">
        {SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={[
                "flex min-h-14 items-center justify-between rounded-lg border px-3 text-left transition",
                isActive
                  ? "border-brand-violet bg-brand-violet text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
              ].join(" ")}
            >
              <span>
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
              </span>
              <span aria-hidden="true">›</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-zinc-200 pt-5 text-xs text-zinc-500 lg:block">
        SSOT · docs/00-process/status.json
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
    <div className={["rounded-lg border p-4", toneClass].join(" ")}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
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
}: {
  status: ProcessStatus;
  overallProgress: number;
  queue: Array<ProcessCheckItem & { phaseId: string; phaseName: string }>;
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

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-brand-violet">
              현재 Sprint · {status.sprint.id}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-950">
              {status.sprint.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              {status.sprint.goal}
            </p>
          </div>
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-600">전체 진행률</span>
              <span className="font-bold text-zinc-950">{overallProgress}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={overallProgress} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-7">
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
        <Metric label="Feature" value={`${doneFeatures.length}/${status.features.length}`} tone="green" />
        <Metric label="Queue" value={pendingWork.length} tone={pendingWork.length ? "amber" : "green"} />
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

function DeliverablesSection({
  deliverables,
}: {
  deliverables: ProcessDeliverable[];
}) {
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
                className="grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[90px_1fr_120px_140px_110px] lg:items-center"
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
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="grid border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:grid-cols-[100px_1fr_120px_120px_120px]">
        <span>ID</span>
        <span>대상</span>
        <span>승인자</span>
        <span>일자</span>
        <span>상태</span>
      </div>
      <ul>
        {approvals.map((approval) => (
          <li
            key={approval.id}
            className="grid gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[100px_1fr_120px_120px_120px] lg:items-center"
          >
            <span className="font-mono text-xs font-semibold text-brand-violet">
              {approval.id}
            </span>
            <div>
              <p className="font-semibold text-zinc-950">{approval.target}</p>
              <p className="mt-1 text-xs text-zinc-500">{approval.summary}</p>
              <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                {approval.doc}
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-500">
              {approval.approver}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              {approval.approvedAt}
            </span>
            <ApprovalBadge status={approval.status} />
          </li>
        ))}
      </ul>
    </section>
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

function TraceabilitySection({ traces }: { traces: ProcessTraceLink[] }) {
  return (
    <div className="space-y-4">
      {traces.map((trace) => (
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
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-zinc-100 px-4 py-4 lg:grid-cols-2">
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
          </div>
        </article>
      ))}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchProcessStatus();
      setStatus(data);
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
      />

      <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-violet">
              {active?.eyebrow}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              {active?.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-brand-violet hover:text-brand-violet"
          >
            새로고침
          </button>
        </header>

        {activeSection === "overview" && (
          <OverviewSection
            status={status}
            overallProgress={overallProgress}
            queue={queue}
          />
        )}

        {activeSection === "intakes" && (
          <IntakesSection intakes={status.intakes} />
        )}

        {activeSection === "changes" && (
          <PlanningChangesSection changes={status.planningChanges} />
        )}

        {activeSection === "deliverables" && (
          <DeliverablesSection deliverables={status.deliverables} />
        )}

        {activeSection === "approvals" && (
          <ApprovalsSection approvals={status.approvals} />
        )}

        {activeSection === "traceability" && (
          <TraceabilitySection traces={status.traceLinks} />
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
