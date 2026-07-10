import type { ProcessPhase } from "@goodz/types";
import { ProgressBar, StatusBadge } from "./StatusBadge";

export function PhasePanel({ phase }: { phase: ProcessPhase }) {
  const doneCount = phase.items.filter((i) => i.status === "done").length;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
            {phase.id}
          </p>
          <h3 className="mt-1 text-lg font-bold text-zinc-950">
            {phase.name}
          </h3>
        </div>
        <StatusBadge status={phase.status} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-zinc-500">
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
            className="grid gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <span>
              <span className="block font-medium text-zinc-800">
                {item.label}
              </span>
              {item.doc ? (
                <span className="mt-1 block truncate font-mono text-xs text-zinc-400">
                  {item.doc}
                </span>
              ) : null}
            </span>
            <span className="justify-self-start sm:justify-self-end">
              <StatusBadge status={item.status} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
