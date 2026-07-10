import type { ProcessPhase } from "@goodz/types";
import { ProgressBar, StatusBadge } from "./StatusBadge";

export function PhasePanel({ phase }: { phase: ProcessPhase }) {
  const doneCount = phase.items.filter((i) => i.status === "done").length;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
            {phase.id}
          </p>
          <h3 className="mt-1 text-lg font-bold">{phase.name}</h3>
        </div>
        <StatusBadge status={phase.status} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>
            {doneCount}/{phase.items.length} 항목
          </span>
          <span>{phase.progress}%</span>
        </div>
        <ProgressBar value={phase.progress} />
      </div>

      <ul className="mt-4 space-y-2">
        {phase.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/50 px-3 py-2 text-sm"
          >
            <span className="text-slate-300">{item.label}</span>
            <StatusBadge status={item.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
