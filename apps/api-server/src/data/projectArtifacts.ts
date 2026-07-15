import fs from "node:fs";
import path from "node:path";
import type {
  ProcessArtifactWriteResult,
  ProcessAuditEvent,
  ProcessProject,
  ProcessProjectBook,
  ProcessRun,
  ProcessStageRun,
} from "@goodz/process";

function diskWriteEnabled(databasePath: string) {
  if (process.env.GOODZ_SKIP_ARTIFACT_WRITE === "1") return false;
  if (databasePath === ":memory:") return false;
  return true;
}

function projectRelativeRoot(projectId: string) {
  return `docs/projects/${projectId.toLowerCase()}`;
}

function safeJoinProjects(repoRoot: string, relativePath: string) {
  const normalized = relativePath.replaceAll("\\", "/");
  if (
    path.posix.isAbsolute(normalized) ||
    normalized.split("/").includes("..") ||
    !normalized.startsWith("docs/projects/") ||
    !normalized.endsWith(".md")
  ) {
    throw new Error(`Unsafe artifact path: ${relativePath}`);
  }
  const absoluteRoot = path.resolve(repoRoot);
  const target = path.resolve(absoluteRoot, normalized);
  const allowedRoot = path.resolve(absoluteRoot, "docs/projects");
  if (target !== allowedRoot && !target.startsWith(`${allowedRoot}${path.sep}`)) {
    throw new Error(`Artifact path escaped docs/projects: ${relativePath}`);
  }
  return { normalized, target };
}

function writeMarkdownIfAbsent(
  repoRoot: string,
  relativePath: string,
  content: string,
  enabled: boolean,
  result: ProcessArtifactWriteResult,
) {
  const { normalized, target } = safeJoinProjects(repoRoot, relativePath);
  if (!enabled) {
    result.skipped.push(normalized);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) {
    result.skipped.push(normalized);
    return;
  }
  fs.writeFileSync(target, content, "utf8");
  result.written.push(normalized);
}

function writeMarkdownAlways(
  repoRoot: string,
  relativePath: string,
  content: string,
  enabled: boolean,
): boolean {
  const { target } = safeJoinProjects(repoRoot, relativePath);
  if (!enabled) return false;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  return true;
}

function stageFileName(stage: ProcessStageRun, index: number) {
  const slug = stage.name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "stage";
  return `${String(index).padStart(2, "0")}-p${index}-${slug}.md`;
}

function buildProjectReadme(project: ProcessProject, run: ProcessRun) {
  const stageLines = run.stages
    .map((stage, index) => `- P${index} ${stage.name} · ${stage.status}`)
    .join("\n");
  return `# ${project.name}

> Goodz Process OS가 생성한 프로젝트 스캐폴드입니다.

| 항목 | 값 |
|------|-----|
| Project ID | \`${project.id}\` |
| Run ID | \`${run.id}\` |
| Owner | ${project.owner} |
| Template | \`${run.templateId}\` v${run.templateVersion} |
| 상태 | ${run.status} |

## 목표

${project.summary}

## Stages

${stageLines}

## 폴더 규칙

- \`stages/\` — Stage GO 시 해당 단계 기록이 쌓입니다.
- \`PROJECT_BOOK.md\` — Run 완료 시(또는 Book 다운로드 시) 전체 여정이 기록됩니다.
- 이미 있는 파일은 덮어쓰지 않습니다. 로컬에서 자유롭게 수정하세요.
`;
}

function buildStageMarkdown(
  project: ProcessProject,
  run: ProcessRun,
  stage: ProcessStageRun,
  index: number,
  note: string,
) {
  const tasks = stage.tasks
    .map((task) => `- [${task.status === "done" ? "x" : " "}] **${task.title}** (${task.status})${task.assignee ? ` · ${task.assignee}` : ""}\n  ${task.summary}`)
    .join("\n");
  const deliverables = stage.deliverables.length
    ? stage.deliverables
        .map((item) => `- **${item.title}** · ${item.status}${item.required ? " · required" : ""}${item.uri ? ` · ${item.uri}` : ""}${item.owner ? ` · ${item.owner}` : ""}`)
        .join("\n")
    : "_산출물 없음_";
  const evidence = stage.evidence.length
    ? stage.evidence
        .map((item) => `- \`${item.type}\` **${item.label}** · ${item.url}\n  ${item.summary}`)
        .join("\n")
    : "_증거 없음_";
  return `# P${index} · ${stage.name}

| 항목 | 값 |
|------|-----|
| Project | ${project.name} (\`${project.id}\`) |
| Run | \`${run.id}\` |
| Stage | \`${stage.id}\` |
| Gate | ${stage.gate.decision.toUpperCase()} |
| 기록 시각 | ${new Date().toISOString()} |

## 요약

${stage.summary}

## Gate 메모

${note.trim() || "_없음_"}

## Tasks

${tasks}

## Deliverables

${deliverables}

## Evidence

${evidence}
`;
}

function buildProjectBookMarkdown(
  project: ProcessProject,
  run: ProcessRun,
  auditEvents: ProcessAuditEvent[],
) {
  const stageSections = run.stages
    .map((stage, index) => {
      const tasks = stage.tasks
        .map((task) => `  - ${task.status === "done" ? "✅" : "•"} ${task.title}`)
        .join("\n");
      const deliverables = stage.deliverables
        .map((item) => `  - ${item.title} → ${item.status}${item.uri ? ` (${item.uri})` : ""}`)
        .join("\n");
      return `### P${index} · ${stage.name}

- 상태: **${stage.status}**
- Gate: **${stage.gate.decision.toUpperCase()}**${stage.gate.note ? ` — ${stage.gate.note}` : ""}

**Tasks**
${tasks || "  - _(없음)_"}

**Deliverables**
${deliverables || "  - _(없음)_"}
`;
    })
    .join("\n");

  const auditLines = auditEvents
    .slice(0, 40)
    .map((event) => `- \`${event.createdAt}\` · ${event.entityType}/${event.action} — ${event.detail}`)
    .join("\n");

  return `# Project Book · ${project.name}

> Goodz Process OS가 남긴 프로젝트 여정 기록입니다.

| 항목 | 값 |
|------|-----|
| Project ID | \`${project.id}\` |
| Run ID | \`${run.id}\` |
| Owner | ${project.owner} |
| Template | \`${run.templateId}\` v${run.templateVersion} |
| Run 상태 | **${run.status}** |
| 생성 | ${run.createdAt} |
| 갱신 | ${run.updatedAt} |
| Book 생성 | ${new Date().toISOString()} |

## 목표

${project.summary}

## Stage 여정

${stageSections}

## 최근 실행 이력

${auditLines || "_이력 없음_"}

---

_이 문서는 Dashboard의 **Project Book 다운로드** 또는 마지막 Stage GO로 생성됩니다._
`;
}

export function scaffoldProjectStart(options: {
  repoRoot: string;
  databasePath: string;
  project: ProcessProject;
  run: ProcessRun;
}): ProcessArtifactWriteResult {
  const relativeRoot = projectRelativeRoot(options.project.id);
  const enabled = diskWriteEnabled(options.databasePath);
  const result: ProcessArtifactWriteResult = {
    projectId: options.project.id,
    relativeRoot,
    written: [],
    skipped: [],
    diskWriteEnabled: enabled,
  };
  writeMarkdownIfAbsent(
    options.repoRoot,
    `${relativeRoot}/README.md`,
    buildProjectReadme(options.project, options.run),
    enabled,
    result,
  );
  const first = options.run.stages[0];
  if (first) {
    writeMarkdownIfAbsent(
      options.repoRoot,
      `${relativeRoot}/stages/${stageFileName(first, 0)}`,
      `# P0 · ${first.name}

> Stage가 시작되었습니다. Task를 완료하고 산출물을 승인한 뒤 GO하면 이 파일이 Gate 기록으로 갱신·추가됩니다.

## 목표

${first.summary}

## 체크리스트

${first.tasks.map((task) => `- [ ] ${task.title}`).join("\n") || "- _(Task 없음)_"}
`,
      enabled,
      result,
    );
  }
  return result;
}

export function scaffoldStageGate(options: {
  repoRoot: string;
  databasePath: string;
  project: ProcessProject;
  run: ProcessRun;
  stage: ProcessStageRun;
  stageIndex: number;
  decision: "go" | "hold" | "kill";
  note: string;
  auditEvents: ProcessAuditEvent[];
}): ProcessArtifactWriteResult {
  const relativeRoot = projectRelativeRoot(options.project.id);
  const enabled = diskWriteEnabled(options.databasePath);
  const result: ProcessArtifactWriteResult = {
    projectId: options.project.id,
    relativeRoot,
    written: [],
    skipped: [],
    diskWriteEnabled: enabled,
  };

  if (options.decision === "go") {
    const stagePath = `${relativeRoot}/stages/${stageFileName(options.stage, options.stageIndex)}`;
    const { target } = safeJoinProjects(options.repoRoot, stagePath);
    const content = buildStageMarkdown(
      options.project,
      options.run,
      options.stage,
      options.stageIndex,
      options.note,
    );
    if (!enabled) {
      result.skipped.push(stagePath);
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content, "utf8");
      result.written.push(stagePath);
    }

    const next = options.run.stages[options.stageIndex + 1];
    if (next && options.run.status === "active") {
      writeMarkdownIfAbsent(
        options.repoRoot,
        `${relativeRoot}/stages/${stageFileName(next, options.stageIndex + 1)}`,
        `# P${options.stageIndex + 1} · ${next.name}

> 이전 Stage GO로 시작되었습니다.

## 목표

${next.summary}

## 체크리스트

${next.tasks.map((task) => `- [ ] ${task.title}`).join("\n") || "- _(Task 없음)_"}
`,
        enabled,
        result,
      );
    }

    if (options.run.status === "completed") {
      const bookPath = `${relativeRoot}/PROJECT_BOOK.md`;
      const markdown = buildProjectBookMarkdown(
        options.project,
        options.run,
        options.auditEvents,
      );
      if (writeMarkdownAlways(options.repoRoot, bookPath, markdown, enabled)) {
        result.written.push(bookPath);
      } else {
        result.skipped.push(bookPath);
      }
    }
  }

  return result;
}

export function buildAndMaybeWriteProjectBook(options: {
  repoRoot: string;
  databasePath: string;
  project: ProcessProject;
  run: ProcessRun;
  auditEvents: ProcessAuditEvent[];
}): ProcessProjectBook {
  const relativeRoot = projectRelativeRoot(options.project.id);
  const bookPath = `${relativeRoot}/PROJECT_BOOK.md`;
  const markdown = buildProjectBookMarkdown(
    options.project,
    options.run,
    options.auditEvents,
  );
  const enabled = diskWriteEnabled(options.databasePath);
  const written = writeMarkdownAlways(options.repoRoot, bookPath, markdown, enabled);
  return {
    schemaVersion: 1,
    projectId: options.project.id,
    projectName: options.project.name,
    runId: options.run.id,
    generatedAt: new Date().toISOString(),
    path: bookPath,
    markdown,
    written,
  };
}
