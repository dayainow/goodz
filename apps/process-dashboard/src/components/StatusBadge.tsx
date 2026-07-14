import type { ProcessItemStatus } from "@goodz/process";

const STATUS_LABEL: Record<ProcessItemStatus, string> = {
  done: "완료",
  in_progress: "진행 중",
  pending: "대기",
  blocked: "차단",
};

const STATUS_CLASS: Record<ProcessItemStatus, string> = {
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-zinc-100 text-zinc-600 border-zinc-200",
  blocked: "bg-rose-50 text-rose-700 border-rose-200",
};

export function StatusBadge({ status }: { status: ProcessItemStatus }) {
  return (
    <span
      className={[
        "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASS[status],
      ].join(" ")}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
      <div
        className="h-full rounded-full bg-zinc-950 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
