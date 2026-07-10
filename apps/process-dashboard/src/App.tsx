import { useCallback, useEffect, useState } from "react";
import type { ProcessStatus } from "@goodz/types";
import { fetchProcessStatus } from "./api/process";
import { PhasePanel } from "./components/PhasePanel";
import { ProgressBar, StatusBadge } from "./components/StatusBadge";

export default function App() {
  const [status, setStatus] = useState<ProcessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        프로세스 상태 불러오는 중…
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-rose-400">API 오류: {error ?? "no data"}</p>
        <p className="text-sm text-slate-500">
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 px-8 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-violet">
              Goodz System · Process Monitor
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              풀 프로세스 대시보드
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              SSOT: docs/00-process/status.json · 갱신 {status.updatedAt}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">시스템 버전</p>
            <p className="text-xl font-bold">{status.systemVersion}</p>
            <StatusBadge status={status.sprint.status} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-8 py-8">
        <section className="rounded-2xl border border-brand-violet/30 bg-brand-violet/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-violet">
                현재 Sprint · {status.sprint.id}
              </p>
              <h2 className="mt-1 text-xl font-bold">{status.sprint.name}</h2>
              <p className="mt-2 text-sm text-slate-300">{status.sprint.goal}</p>
            </div>
            <div className="w-full max-w-xs">
              <p className="mb-1 text-xs text-slate-400">전체 진행률</p>
              <ProgressBar value={overallProgress} />
              <p className="mt-1 text-right text-sm font-semibold">
                {overallProgress}%
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Phase Gate</h2>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {status.phases.map((phase) => (
              <PhasePanel key={phase.id} phase={phase} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-bold">기능 백로그</h2>
            <ul className="mt-4 space-y-2">
              {status.features.map((feature) => (
                <li
                  key={feature.id}
                  className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-mono text-xs text-slate-500">
                      {feature.id}
                    </span>{" "}
                    {feature.label}
                  </span>
                  <StatusBadge status={feature.status} />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-bold">앱 · 서비스</h2>
            <ul className="mt-4 space-y-3">
              {status.apps.map((app) => (
                <li
                  key={app.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand-violet hover:underline"
                    >
                      {app.name}
                    </a>
                    <span className="font-mono text-xs text-slate-500">
                      :{app.port}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{app.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
