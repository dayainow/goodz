import type { ProcessItemStatus } from "@goodz/types";

const STATUS_LABEL: Record<ProcessItemStatus, string> = {
  done: "완료",
  in_progress: "진행 중",
  pending: "대기",
  blocked: "차단",
};

const STATUS_CLASS: Record<ProcessItemStatus, string> = {
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  in_progress: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  pending: "bg-slate-700 text-slate-400 border-slate-600",
  blocked: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

export function StatusBadge({ status }: { status: ProcessItemStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASS[status],
      ].join(" ")}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-brand-violet transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
