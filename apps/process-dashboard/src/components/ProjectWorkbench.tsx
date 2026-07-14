import { useState } from "react";
import type { FormEvent } from "react";
import type {
  ProcessDesignPack,
  ProcessDesignJob,
  ProcessDesignScreen,
  ProcessProject,
  ProcessProjectBrief,
  ProcessStoryboardStep,
  UpdateProcessDesignPackRequest,
} from "@goodz/process";
import {
  approveDesignPack,
  approveProjectBrief,
  createDesignJob,
  fetchProjectExport,
  requestDesignChanges,
  startDesignJob,
  submitDesignJob,
  updateDesignPack,
  updateProjectBrief,
} from "../api/process";

const SURFACE = "overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]";
const META = "text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500";
const INPUT = "mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-800";
const DESIGN_JOB_LABEL: Record<ProcessDesignJob["status"], string> = {
  queued: "전달 대기",
  in_progress: "Claude Design 작업 중",
  submitted: "결과 검토",
  changes_requested: "수정 필요",
  approved: "승인 완료",
};

function StatusPill({ status }: { status: "draft" | "approved" }) {
  return <span className={[
    "rounded-full border px-2.5 py-1 text-[11px] font-bold",
    status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700",
  ].join(" ")}>{status === "approved" ? "승인" : "Draft"}</span>;
}

function newScreen(): ProcessDesignScreen {
  return { id: `screen-${Date.now()}-${Math.random()}`, name: "", purpose: "", sections: "", primaryAction: "" };
}

function newStoryStep(): ProcessStoryboardStep {
  return { id: `story-${Date.now()}-${Math.random()}`, actor: "", action: "", screen: "", outcome: "" };
}

function previewList(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => `- ${line}`).join("\n");
}

function buildBriefPreview(project: ProcessProject, brief: ProcessProjectBrief) {
  return `# ${project.name} PRD\n\n> ${project.summary}\n\n## 문제 정의\n\n${brief.problem}\n\n## 타깃 사용자\n\n${brief.targetUsers}\n\n## 핵심 가치\n\n${brief.valueProposition}\n\n## MVP 범위\n\n${previewList(brief.mvpScope)}\n\n## 비목표\n\n${previewList(brief.outOfScope)}\n\n## 성공 지표\n\n${previewList(brief.successMetrics)}\n\n## 제약과 가정\n\n${previewList(brief.constraints)}\n`;
}

export function ProjectWorkbench({
  project,
  brief,
  designPack,
  designJobs,
  onRefresh,
}: {
  project: ProcessProject;
  brief: ProcessProjectBrief;
  designPack: ProcessDesignPack;
  designJobs: ProcessDesignJob[];
  onRefresh: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"prd" | "design">("prd");
  const [briefDraft, setBriefDraft] = useState(brief);
  const [designDraft, setDesignDraft] = useState(designPack);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState(designJobs[0]?.resultUrl ?? "");
  const [jobNote, setJobNote] = useState(designJobs[0]?.note ?? "");
  const briefPreview = buildBriefPreview(project, briefDraft);
  const activeJob = designJobs[0] ?? null;

  const runCommand = async (command: () => Promise<unknown>, success: string) => {
    setSaving(true);
    setMessage(null);
    try {
      await command();
      await onRefresh();
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Workbench command failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBriefSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runCommand(() => updateProjectBrief(project.id, {
      problem: briefDraft.problem,
      targetUsers: briefDraft.targetUsers,
      valueProposition: briefDraft.valueProposition,
      mvpScope: briefDraft.mvpScope,
      outOfScope: briefDraft.outOfScope,
      successMetrics: briefDraft.successMetrics,
      constraints: briefDraft.constraints,
    }), "PRD 초안을 저장했습니다. 내용을 확인한 뒤 승인하세요.");
  };

  const handleDesignSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: UpdateProcessDesignPackRequest = {
      conceptName: designDraft.conceptName,
      mood: designDraft.mood,
      palette: designDraft.palette,
      typography: designDraft.typography,
      screens: designDraft.screens.map(({ name, purpose, sections, primaryAction }) => ({ name, purpose, sections, primaryAction })),
      storyboard: designDraft.storyboard.map(({ actor, action, screen, outcome }) => ({ actor, action, screen, outcome })),
      handoffUrl: designDraft.handoffUrl,
    };
    void runCommand(() => updateDesignPack(project.id, input), "Design Pack을 저장하고 Claude Design 프롬프트를 갱신했습니다.");
  };

  const updateScreen = (id: string, change: Partial<ProcessDesignScreen>) => {
    setDesignDraft((current) => ({ ...current, screens: current.screens.map((screen) => screen.id === id ? { ...screen, ...change } : screen) }));
  };

  const updateStory = (id: string, change: Partial<ProcessStoryboardStep>) => {
    setDesignDraft((current) => ({ ...current, storyboard: current.storyboard.map((step) => step.id === id ? { ...step, ...change } : step) }));
  };

  const handleExport = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const bundle = await fetchProjectExport(project.id);
      const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.id.toLowerCase()}-goodz-export.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage(`PRD와 Design Pack Markdown ${bundle.files.length}건을 내보냈습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Project export failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={SURFACE}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
        <div>
          <p className={META}>Project workbench</p>
          <h3 className="mt-1 text-lg font-bold text-zinc-950">PRD → MVP Design → Claude Design Handoff</h3>
        </div>
        <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
          <button type="button" onClick={() => setActiveTab("prd")} className={["rounded-lg px-3 py-2 text-xs font-bold", activeTab === "prd" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-200"].join(" ")}>1. PRD Wizard</button>
          <button type="button" onClick={() => setActiveTab("design")} className={["rounded-lg px-3 py-2 text-xs font-bold", activeTab === "design" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-200"].join(" ")}>2. Design Workbench</button>
        </div>
      </header>

      {activeTab === "prd" ? (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <form onSubmit={handleBriefSave} className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3"><div><p className={META}>Guided PRD</p><p className="mt-1 text-xs text-zinc-500">각 질문에 답하면 검토 가능한 Markdown PRD가 만들어집니다.</p></div><StatusPill status={brief.status} /></div>
            <label className="block text-xs font-bold text-zinc-700">어떤 문제를 해결하나요?<textarea value={briefDraft.problem} onChange={(event) => setBriefDraft((current) => ({ ...current, problem: event.target.value }))} rows={3} maxLength={4000} placeholder="현재 사용자가 겪는 문제와 왜 지금 해결해야 하는지" className={INPUT} /></label>
            <label className="block text-xs font-bold text-zinc-700">누구를 위한 제품인가요?<textarea value={briefDraft.targetUsers} onChange={(event) => setBriefDraft((current) => ({ ...current, targetUsers: event.target.value }))} rows={2} maxLength={4000} placeholder="핵심 사용자, 상황, 행동 특성" className={INPUT} /></label>
            <label className="block text-xs font-bold text-zinc-700">사용자에게 어떤 결과를 제공하나요?<textarea value={briefDraft.valueProposition} onChange={(event) => setBriefDraft((current) => ({ ...current, valueProposition: event.target.value }))} rows={2} maxLength={4000} placeholder="경쟁 대안보다 명확한 핵심 가치" className={INPUT} /></label>
            <div className="grid gap-4 md:grid-cols-2"><label className="block text-xs font-bold text-zinc-700">MVP 범위<textarea value={briefDraft.mvpScope} onChange={(event) => setBriefDraft((current) => ({ ...current, mvpScope: event.target.value }))} rows={5} maxLength={4000} placeholder={"상품 목록\n상품 상세\n장바구니\n체크아웃"} className={INPUT} /></label><label className="block text-xs font-bold text-zinc-700">이번에 만들지 않는 것<textarea value={briefDraft.outOfScope} onChange={(event) => setBriefDraft((current) => ({ ...current, outOfScope: event.target.value }))} rows={5} maxLength={4000} placeholder={"실결제\n리뷰\n쿠폰\n다국어"} className={INPUT} /></label></div>
            <div className="grid gap-4 md:grid-cols-2"><label className="block text-xs font-bold text-zinc-700">성공 지표<textarea value={briefDraft.successMetrics} onChange={(event) => setBriefDraft((current) => ({ ...current, successMetrics: event.target.value }))} rows={4} maxLength={4000} placeholder={"구매 완료율 3%\n장바구니 이탈률 50% 이하"} className={INPUT} /></label><label className="block text-xs font-bold text-zinc-700">제약과 가정<textarea value={briefDraft.constraints} onChange={(event) => setBriefDraft((current) => ({ ...current, constraints: event.target.value }))} rows={4} maxLength={4000} placeholder={"4주 내 MVP\n모바일 우선\n결제는 mock"} className={INPUT} /></label></div>
            <div className="flex flex-wrap justify-end gap-2"><button type="submit" disabled={saving} className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-xs font-bold text-zinc-800 hover:bg-zinc-100 disabled:opacity-40">초안 저장</button><button type="button" disabled={saving || brief.status === "approved"} onClick={() => void runCommand(() => approveProjectBrief(project.id), "PRD를 승인했습니다. Design Workbench를 진행할 수 있습니다.")} className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-35">PRD 승인</button></div>
          </form>
          <aside className="border-t border-zinc-100 bg-zinc-950 p-5 text-zinc-100 xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Generated PRD.md</p><button type="button" onClick={() => void navigator.clipboard.writeText(briefPreview)} className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[10px] font-bold text-zinc-300 hover:bg-white/10">복사</button></div>
            <pre className="mt-4 max-h-[780px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-300">{briefPreview}</pre>
          </aside>
        </div>
      ) : (
        <form onSubmit={handleDesignSave} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className={META}>MVP design preparation</p><h4 className="mt-1 font-bold text-zinc-950">와이어프레임·스토리보드·콘셉트</h4><p className="mt-1 text-xs leading-5 text-zinc-500">구조와 방향을 먼저 잠근 뒤 Claude Design에서 high-fidelity UI를 제작합니다.</p></div><div className="flex items-center gap-2"><StatusPill status={designPack.status} /><span className={["rounded-full px-2.5 py-1 text-[11px] font-bold", brief.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"].join(" ")}>PRD {brief.status === "approved" ? "ready" : "먼저 승인"}</span></div></div>

          <section className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"><p className={META}>Design concept</p><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-bold text-zinc-700">방향<input value={designDraft.conceptName} onChange={(event) => setDesignDraft((current) => ({ ...current, conceptName: event.target.value }))} placeholder="Premium friendly commerce" className={INPUT} /></label><label className="text-xs font-bold text-zinc-700">무드<input value={designDraft.mood} onChange={(event) => setDesignDraft((current) => ({ ...current, mood: event.target.value }))} placeholder="따뜻하고 신뢰감 있는" className={INPUT} /></label><label className="text-xs font-bold text-zinc-700">팔레트<input value={designDraft.palette} onChange={(event) => setDesignDraft((current) => ({ ...current, palette: event.target.value }))} placeholder="#171717, ivory, violet" className={INPUT} /></label><label className="text-xs font-bold text-zinc-700">타이포그래피<input value={designDraft.typography} onChange={(event) => setDesignDraft((current) => ({ ...current, typography: event.target.value }))} placeholder="Noto Sans KR, bold headings" className={INPUT} /></label></div></section>

          <section className="mt-5"><div className="flex items-center justify-between gap-3"><div><p className={META}>Wireframe screens</p><p className="mt-1 text-xs text-zinc-500">화면 목적·영역·주요 행동을 정의합니다.</p></div><button type="button" disabled={designDraft.screens.length >= 30} onClick={() => setDesignDraft((current) => ({ ...current, screens: [...current.screens, newScreen()] }))} className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-bold hover:bg-zinc-100">+ 화면</button></div><div className="mt-3 space-y-2">{designDraft.screens.map((screen, index) => <article key={screen.id} className="grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 lg:grid-cols-[32px_0.8fr_1fr_1.2fr_1fr_auto] lg:items-center"><span className="font-mono text-xs font-bold text-violet-700">S{index + 1}</span><input aria-label={`화면 ${index + 1} 이름`} value={screen.name} onChange={(event) => updateScreen(screen.id, { name: event.target.value })} placeholder="화면 이름" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`화면 ${index + 1} 목적`} value={screen.purpose} onChange={(event) => updateScreen(screen.id, { purpose: event.target.value })} placeholder="사용자 목적" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`화면 ${index + 1} 섹션`} value={screen.sections} onChange={(event) => updateScreen(screen.id, { sections: event.target.value })} placeholder="Hero, 상품 그리드, 필터" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`화면 ${index + 1} 주요 행동`} value={screen.primaryAction} onChange={(event) => updateScreen(screen.id, { primaryAction: event.target.value })} placeholder="상품 상세 열기" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><button type="button" onClick={() => setDesignDraft((current) => ({ ...current, screens: current.screens.filter((item) => item.id !== screen.id) }))} className="h-9 rounded-lg px-2 text-xs font-bold text-rose-600 hover:bg-rose-50">삭제</button></article>)}{designDraft.screens.length === 0 ? <p className="rounded-2xl border border-dashed border-zinc-300 py-8 text-center text-xs text-zinc-500">첫 와이어프레임 화면을 추가하세요.</p> : null}</div></section>

          <section className="mt-5"><div className="flex items-center justify-between gap-3"><div><p className={META}>Storyboard</p><p className="mt-1 text-xs text-zinc-500">사용자가 화면을 거쳐 얻는 결과를 순서대로 정의합니다.</p></div><button type="button" disabled={designDraft.storyboard.length >= 50} onClick={() => setDesignDraft((current) => ({ ...current, storyboard: [...current.storyboard, newStoryStep()] }))} className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-bold hover:bg-zinc-100">+ 장면</button></div><div className="mt-3 space-y-2">{designDraft.storyboard.map((step, index) => <article key={step.id} className="grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 lg:grid-cols-[32px_0.7fr_1.1fr_0.8fr_1.1fr_auto] lg:items-center"><span className="font-mono text-xs font-bold text-violet-700">{index + 1}</span><input aria-label={`장면 ${index + 1} 사용자`} value={step.actor} onChange={(event) => updateStory(step.id, { actor: event.target.value })} placeholder="사용자" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`장면 ${index + 1} 행동`} value={step.action} onChange={(event) => updateStory(step.id, { action: event.target.value })} placeholder="상품을 탐색한다" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`장면 ${index + 1} 화면`} value={step.screen} onChange={(event) => updateStory(step.id, { screen: event.target.value })} placeholder="상품 목록" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><input aria-label={`장면 ${index + 1} 결과`} value={step.outcome} onChange={(event) => updateStory(step.id, { outcome: event.target.value })} placeholder="원하는 상품을 발견한다" className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs" /><button type="button" onClick={() => setDesignDraft((current) => ({ ...current, storyboard: current.storyboard.filter((item) => item.id !== step.id) }))} className="h-9 rounded-lg px-2 text-xs font-bold text-rose-600 hover:bg-rose-50">삭제</button></article>)}{designDraft.storyboard.length === 0 ? <p className="rounded-2xl border border-dashed border-zinc-300 py-8 text-center text-xs text-zinc-500">첫 사용자 장면을 추가하세요.</p> : null}</div></section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-[#F4F4F5]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4"><div><p className={META}>MVP concept preview</p><h4 className="mt-1 font-bold text-zinc-950">{designDraft.conceptName || "디자인 콘셉트 미리보기"}</h4></div><div className="text-right text-[11px] leading-5 text-zinc-500"><p>{designDraft.mood || "무드를 입력하세요"}</p><p className="font-mono">{designDraft.palette || "팔레트를 입력하세요"}</p></div></div>
            <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
              {designDraft.screens.map((screen) => (
                <article key={`preview-${screen.id}`} className="overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-100 px-3 py-2"><span className="h-2 w-2 rounded-full bg-rose-300" /><span className="h-2 w-2 rounded-full bg-amber-300" /><span className="h-2 w-2 rounded-full bg-emerald-300" /><span className="ml-2 truncate font-mono text-[9px] text-zinc-400">{screen.name || "Untitled screen"}</span></div>
                  <div className="p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700">{project.name}</p><h5 className="mt-2 text-lg font-extrabold tracking-tight text-zinc-950">{screen.name || "화면 이름"}</h5><p className="mt-1 min-h-10 text-xs leading-5 text-zinc-500">{screen.purpose || "이 화면의 사용자 목적이 표시됩니다."}</p><div className="mt-4 space-y-2">{screen.sections.split(",").map((section) => section.trim()).filter(Boolean).map((section, index) => <div key={`${screen.id}-${section}-${index}`} className={index === 0 ? "h-16 rounded-xl bg-gradient-to-br from-violet-100 to-zinc-100 p-3 text-[10px] font-bold text-violet-800" : "rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[10px] font-semibold text-zinc-600"}>{section}</div>)}{!screen.sections.trim() ? <div className="h-24 rounded-xl border border-dashed border-zinc-300 bg-zinc-50" /> : null}</div><button type="button" className="mt-4 w-full rounded-xl bg-zinc-950 px-3 py-2.5 text-xs font-bold text-white">{screen.primaryAction || "Primary action"}</button></div>
                </article>
              ))}
              {designDraft.screens.length === 0 ? <p className="col-span-full py-10 text-center text-xs text-zinc-500">화면을 추가하면 콘셉트가 적용된 MVP 목업이 여기에 표시됩니다.</p> : null}
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl bg-zinc-950 text-white">
            <div className="grid gap-5 p-5 xl:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Claude Design connector</p>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-zinc-200">{activeJob ? DESIGN_JOB_LABEL[activeJob.status] : "작업 없음"}</span>
                </div>
                <p className="mt-3 text-sm font-bold">수동 Claude Design 어댑터</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">Goodz가 prompt snapshot과 작업 상태를 관리합니다. Claude Design에서 제작한 뒤 결과 URL을 제출하세요.</p>
                {activeJob?.status === "in_progress" ? <input value={resultUrl} onChange={(event) => setResultUrl(event.target.value)} placeholder="https://claude.ai/design/..." className="mt-4 h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-zinc-600" /> : null}
                {activeJob?.status === "in_progress" || activeJob?.status === "submitted" ? <textarea value={jobNote} onChange={(event) => setJobNote(event.target.value)} rows={3} placeholder={activeJob.status === "submitted" ? "수정이 필요하면 구체적인 요청을 입력하세요." : "검토할 화면과 주요 변경 사항"} className="mt-3 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs leading-5 text-white placeholder:text-zinc-600" /> : null}
                {activeJob?.resultUrl ? <a href={activeJob.resultUrl} target="_blank" rel="noreferrer" className="mt-4 block truncate text-xs font-bold text-violet-300 hover:text-violet-200">{activeJob.resultUrl}</a> : null}
                {activeJob?.note && activeJob.status !== "in_progress" && activeJob.status !== "submitted" ? <p className="mt-2 rounded-xl bg-white/5 p-3 text-xs leading-5 text-zinc-300">{activeJob.note}</p> : null}
              </div>
              <div>
                <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Generated handoff prompt</p><button type="button" onClick={() => void navigator.clipboard.writeText(activeJob?.promptSnapshot ?? designPack.handoffPrompt)} className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[10px] font-bold text-zinc-300 hover:bg-white/10">복사</button></div>
                <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-5 text-zinc-400">{activeJob?.promptSnapshot ?? designPack.handoffPrompt}</pre>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-white/5 px-5 py-4">
              {!activeJob || activeJob.status === "changes_requested" ? <button type="button" disabled={saving || brief.status !== "approved"} onClick={() => void runCommand(() => createDesignJob(project.id), "Claude Design handoff 작업을 생성했습니다.")} className="rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-35">Handoff 작업 생성</button> : null}
              {activeJob?.status === "queued" ? <button type="button" disabled={saving} onClick={() => void runCommand(() => startDesignJob(project.id, activeJob.id), "Claude Design 작업을 시작했습니다. 프롬프트를 복사해 제작을 진행하세요.")} className="rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-35">작업 시작</button> : null}
              {activeJob?.status === "in_progress" ? <button type="button" disabled={saving || !resultUrl.trim()} onClick={() => void runCommand(() => submitDesignJob(project.id, activeJob.id, { resultUrl, note: jobNote }), "Claude Design 결과를 검토 대기 상태로 제출했습니다.")} className="rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-35">결과 제출</button> : null}
              {activeJob?.status === "submitted" ? <button type="button" disabled={saving || !jobNote.trim()} onClick={() => void runCommand(() => requestDesignChanges(project.id, activeJob.id, { note: jobNote }), "디자인 수정 요청을 기록했습니다.")} className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-white/10 disabled:opacity-35">수정 요청</button> : null}
              {activeJob?.status === "submitted" ? <button type="button" disabled={saving} onClick={() => void runCommand(() => approveDesignPack(project.id), "Design Pack과 Claude Design 결과를 승인했습니다.")} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-400 disabled:opacity-35">Design 승인</button> : null}
              {activeJob?.status === "approved" ? <button type="button" disabled={saving} onClick={() => void handleExport()} className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 disabled:opacity-35">산출물 번들 다운로드</button> : null}
            </div>
          </section>
          <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="submit" disabled={saving} className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-xs font-bold text-zinc-800 hover:bg-zinc-100 disabled:opacity-40">Design Pack 저장</button></div>
        </form>
      )}
      {message ? <p className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 text-xs text-zinc-700">{message}</p> : null}
    </section>
  );
}
