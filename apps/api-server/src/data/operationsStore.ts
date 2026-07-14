import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import type {
  CreateProcessProjectRequest,
  CreateProcessProjectResponse,
  CreateProcessIncidentRequest,
  DecideProcessGateRequest,
  ProcessAuditEvent,
  ProcessGateDecision,
  ProcessIncident,
  ProcessOperationsOverview,
  ProcessProject,
  ProcessRun,
  ProcessStageRun,
  ProcessTaskRun,
  ProcessTemplate,
  ProcessWorkspaceOverview,
  UpdateProcessStageRequest,
  UpdateProcessTaskRequest,
} from "@goodz/process";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const docsRoot = path.join(repoRoot, "docs");
const defaultDatabasePath = path.join(repoRoot, "data/goodz.db");
const databasePath = process.env.GOODZ_DB_PATH ?? defaultDatabasePath;
const durability =
  databasePath === ":memory:"
    ? "memory"
    : process.env.GOODZ_DB_DURABILITY === "persistent"
      ? "persistent"
      : "local";

if (databasePath !== ":memory:") {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON");
database.exec("PRAGMA journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS operations_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS document_index (
    path TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    modified_at TEXT NOT NULL,
    synced_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL CHECK (status IN ('open', 'resolved')),
    summary TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    resolved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version INTEGER NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_template_stages (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES process_templates(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    position INTEGER NOT NULL,
    UNIQUE(template_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_template_tasks (
    id TEXT PRIMARY KEY,
    stage_id TEXT NOT NULL REFERENCES process_template_stages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    position INTEGER NOT NULL,
    UNIQUE(stage_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_runs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES process_projects(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES process_templates(id),
    template_version INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'blocked', 'completed', 'cancelled')),
    current_stage_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_stage_runs (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES process_runs(id) ON DELETE CASCADE,
    template_stage_id TEXT NOT NULL REFERENCES process_template_stages(id),
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'in_progress', 'pending', 'blocked')),
    position INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(run_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_task_runs (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    template_task_id TEXT NOT NULL REFERENCES process_template_tasks(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'in_progress', 'pending', 'blocked')),
    assignee TEXT NOT NULL,
    position INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(stage_run_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_gate_decisions (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL UNIQUE REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('pending', 'go', 'hold', 'kill')),
    note TEXT NOT NULL,
    decided_at TEXT,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_audit_events (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'run', 'stage', 'task', 'gate')),
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (1, datetime('now'));

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (2, datetime('now'));
`);

const DEFAULT_TEMPLATE_ID = "TPL-GOODZ-P0-P4-V1";
const DEFAULT_TEMPLATE_STAGES = [
  {
    code: "P0",
    name: "기획",
    summary: "문제, 사용자, 범위와 성공 기준을 잠급니다.",
    tasks: [
      ["기획 입력 등록", "요청의 출처와 해결할 문제를 기록합니다."],
      ["PRD 승인 준비", "범위와 인수 기준을 검토 가능한 상태로 만듭니다."],
    ],
  },
  {
    code: "P1",
    name: "디자인",
    summary: "정보 구조와 핵심 화면의 handoff를 확정합니다.",
    tasks: [
      ["화면 흐름 설계", "핵심 사용자 흐름과 화면 구조를 정의합니다."],
      ["디자인 Gate 준비", "스펙, 상태, 접근성 기준을 연결합니다."],
    ],
  },
  {
    code: "P2",
    name: "개발",
    summary: "계약, 코드와 CI 증거를 연결해 구현합니다.",
    tasks: [
      ["구현 작업 연결", "Issue, PR과 담당자를 실행 항목에 연결합니다."],
      ["CI 검증", "타입, 빌드, 린트와 테스트 증거를 확인합니다."],
    ],
  },
  {
    code: "P3",
    name: "QA",
    summary: "기능, UX, 데이터와 회귀 위험을 검증합니다.",
    tasks: [
      ["테스트 플랜 실행", "필수 시나리오와 회귀 항목을 확인합니다."],
      ["릴리스 결함 정리", "차단 결함과 잔여 위험을 기록합니다."],
    ],
  },
  {
    code: "P4",
    name: "배포",
    summary: "승인, 배포와 smoke 증거로 작업을 닫습니다.",
    tasks: [
      ["릴리스 승인", "릴리스 체크리스트와 승인자를 확인합니다."],
      ["배포 증거 연결", "Release와 smoke 결과를 기록합니다."],
    ],
  },
] as const;

function seedDefaultProcessTemplate() {
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        INSERT OR IGNORE INTO process_templates(id, name, version, summary, created_at)
        VALUES (?, ?, 1, ?, ?)
      `)
      .run(
        DEFAULT_TEMPLATE_ID,
        "Goodz Product Delivery P0-P4",
        "기획부터 배포까지 Gate로 연결하는 기본 제품 전달 프로세스",
        now,
      );

    DEFAULT_TEMPLATE_STAGES.forEach((stage, stageIndex) => {
      const stageId = `${DEFAULT_TEMPLATE_ID}-${stage.code}`;
      database
        .prepare(`
          INSERT OR IGNORE INTO process_template_stages(
            id, template_id, code, name, summary, position
          ) VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          stageId,
          DEFAULT_TEMPLATE_ID,
          stage.code,
          stage.name,
          stage.summary,
          stageIndex,
        );

      stage.tasks.forEach(([title, summary], taskIndex) => {
        database
          .prepare(`
            INSERT OR IGNORE INTO process_template_tasks(
              id, stage_id, title, summary, position
            ) VALUES (?, ?, ?, ?, ?)
          `)
          .run(
            `${stageId}-T${taskIndex + 1}`,
            stageId,
            title,
            summary,
            taskIndex,
          );
      });
    });
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function markdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : [];
  });
}

function documentTitle(content: string, fallback: string) {
  const heading = content
    .split("\n")
    .find((line) => line.trim().startsWith("# "));
  return heading ? heading.replace(/^#\s+/, "").trim() : fallback;
}

export function syncDocumentIndex() {
  const syncedAt = new Date().toISOString();
  const upsert = database.prepare(`
    INSERT INTO document_index(path, title, modified_at, synced_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      title = excluded.title,
      modified_at = excluded.modified_at,
      synced_at = excluded.synced_at
  `);

  database.exec("BEGIN IMMEDIATE");
  try {
    for (const absolutePath of markdownFiles(docsRoot)) {
      const relativePath = path.relative(repoRoot, absolutePath);
      const content = fs.readFileSync(absolutePath, "utf8");
      const modifiedAt = fs.statSync(absolutePath).mtime.toISOString();
      upsert.run(
        relativePath,
        documentTitle(content, path.basename(absolutePath)),
        modifiedAt,
        syncedAt,
      );
    }
    database
      .prepare("INSERT OR REPLACE INTO operations_meta(key, value) VALUES (?, ?)")
      .run("documents_synced_at", syncedAt);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

interface IncidentRow {
  id: string;
  title: string;
  severity: ProcessIncident["severity"];
  status: ProcessIncident["status"];
  summary: string;
  occurred_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

function toIncident(row: IncidentRow): ProcessIncident {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    summary: row.summary,
    occurredAt: row.occurred_at,
    ...(row.resolved_at ? { resolvedAt: row.resolved_at } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listIncidents(): ProcessIncident[] {
  const rows = database
    .prepare("SELECT * FROM incidents ORDER BY occurred_at DESC, created_at DESC")
    .all() as unknown as IncidentRow[];
  return rows.map(toIncident);
}

export function createIncident(
  input: CreateProcessIncidentRequest,
): ProcessIncident {
  const now = new Date().toISOString();
  const incident: ProcessIncident = {
    id: `INC-${randomUUID().slice(0, 8).toUpperCase()}`,
    title: input.title.trim(),
    severity: input.severity,
    status: "open",
    summary: input.summary.trim(),
    occurredAt: input.occurredAt ?? now,
    createdAt: now,
    updatedAt: now,
  };

  database
    .prepare(`
      INSERT INTO incidents(
        id, title, severity, status, summary, occurred_at, resolved_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)
    `)
    .run(
      incident.id,
      incident.title,
      incident.severity,
      incident.status,
      incident.summary,
      incident.occurredAt,
      incident.createdAt,
      incident.updatedAt,
    );

  return incident;
}

export function resolveIncident(id: string): ProcessIncident | null {
  const resolvedAt = new Date().toISOString();
  const result = database
    .prepare(`
      UPDATE incidents
      SET status = 'resolved', resolved_at = ?, updated_at = ?
      WHERE id = ? AND status = 'open'
    `)
    .run(resolvedAt, resolvedAt, id);

  if (result.changes === 0) return null;
  const row = database
    .prepare("SELECT * FROM incidents WHERE id = ?")
    .get(id) as unknown as IncidentRow;
  return toIncident(row);
}

interface TemplateRow {
  id: string;
  name: string;
  version: number;
  summary: string;
  created_at: string;
}

interface TemplateStageRow {
  id: string;
  template_id: string;
  name: string;
  summary: string;
  position: number;
}

interface TemplateTaskRow {
  id: string;
  stage_id: string;
  title: string;
  summary: string;
  position: number;
}

interface ProjectRow {
  id: string;
  name: string;
  summary: string;
  owner: string;
  status: ProcessProject["status"];
  created_at: string;
  updated_at: string;
}

interface RunRow {
  id: string;
  project_id: string;
  template_id: string;
  template_version: number;
  status: ProcessRun["status"];
  current_stage_id: string | null;
  created_at: string;
  updated_at: string;
}

interface StageRunRow {
  id: string;
  run_id: string;
  template_stage_id: string;
  name: string;
  summary: string;
  status: ProcessStageRun["status"];
  position: number;
  updated_at: string;
}

interface TaskRunRow {
  id: string;
  stage_run_id: string;
  template_task_id: string;
  title: string;
  summary: string;
  status: ProcessTaskRun["status"];
  assignee: string;
  position: number;
  updated_at: string;
}

interface GateRow {
  id: string;
  stage_run_id: string;
  decision: ProcessGateDecision;
  note: string;
  decided_at: string | null;
  updated_at: string;
}

interface AuditRow {
  id: string;
  entity_type: ProcessAuditEvent["entityType"];
  entity_id: string;
  action: string;
  detail: string;
  created_at: string;
}

function recordAudit(
  entityType: ProcessAuditEvent["entityType"],
  entityId: string,
  action: string,
  detail: string,
  createdAt = new Date().toISOString(),
) {
  database
    .prepare(`
      INSERT INTO process_audit_events(
        id, entity_type, entity_id, action, detail, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      `EVT-${randomUUID().slice(0, 8).toUpperCase()}`,
      entityType,
      entityId,
      action,
      detail,
      createdAt,
    );
}

function listProcessTemplates(): ProcessTemplate[] {
  const templates = database
    .prepare("SELECT * FROM process_templates ORDER BY name, version DESC")
    .all() as unknown as TemplateRow[];
  const stages = database
    .prepare("SELECT * FROM process_template_stages ORDER BY template_id, position")
    .all() as unknown as TemplateStageRow[];
  const tasks = database
    .prepare("SELECT * FROM process_template_tasks ORDER BY stage_id, position")
    .all() as unknown as TemplateTaskRow[];

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    version: template.version,
    summary: template.summary,
    createdAt: template.created_at,
    stages: stages
      .filter((stage) => stage.template_id === template.id)
      .map((stage) => ({
        id: stage.id,
        name: stage.name,
        summary: stage.summary,
        position: stage.position,
        tasks: tasks
          .filter((task) => task.stage_id === stage.id)
          .map((task) => ({
            id: task.id,
            title: task.title,
            summary: task.summary,
          })),
      })),
  }));
}

function toProject(row: ProjectRow): ProcessProject {
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    owner: row.owner,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function loadProcessRun(row: RunRow): ProcessRun {
  const stageRows = database
    .prepare("SELECT * FROM process_stage_runs WHERE run_id = ? ORDER BY position")
    .all(row.id) as unknown as StageRunRow[];

  return {
    id: row.id,
    projectId: row.project_id,
    templateId: row.template_id,
    templateVersion: row.template_version,
    status: row.status,
    currentStageId: row.current_stage_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stages: stageRows.map((stage): ProcessStageRun => {
      const tasks = database
        .prepare("SELECT * FROM process_task_runs WHERE stage_run_id = ? ORDER BY position")
        .all(stage.id) as unknown as TaskRunRow[];
      const gate = database
        .prepare("SELECT * FROM process_gate_decisions WHERE stage_run_id = ?")
        .get(stage.id) as unknown as GateRow;
      return {
        id: stage.id,
        templateStageId: stage.template_stage_id,
        name: stage.name,
        summary: stage.summary,
        status: stage.status,
        position: stage.position,
        updatedAt: stage.updated_at,
        tasks: tasks.map((task) => ({
          id: task.id,
          templateTaskId: task.template_task_id,
          title: task.title,
          summary: task.summary,
          status: task.status,
          assignee: task.assignee,
          position: task.position,
          updatedAt: task.updated_at,
        })),
        gate: {
          id: gate.id,
          decision: gate.decision,
          note: gate.note,
          ...(gate.decided_at ? { decidedAt: gate.decided_at } : {}),
          updatedAt: gate.updated_at,
        },
      };
    }),
  };
}

function getRunRow(id: string): RunRow {
  const row = database
    .prepare("SELECT * FROM process_runs WHERE id = ?")
    .get(id) as unknown as RunRow | undefined;
  if (!row) throw new Error("Process run not found");
  return row;
}

export function loadProcessWorkspace(): ProcessWorkspaceOverview {
  const projects = database
    .prepare("SELECT * FROM process_projects ORDER BY updated_at DESC")
    .all() as unknown as ProjectRow[];
  const runs = database
    .prepare("SELECT * FROM process_runs ORDER BY updated_at DESC")
    .all() as unknown as RunRow[];
  const audits = database
    .prepare("SELECT * FROM process_audit_events ORDER BY created_at DESC LIMIT 30")
    .all() as unknown as AuditRow[];

  return {
    templates: listProcessTemplates(),
    projects: projects.map(toProject),
    runs: runs.map(loadProcessRun),
    auditEvents: audits.map((audit) => ({
      id: audit.id,
      entityType: audit.entity_type,
      entityId: audit.entity_id,
      action: audit.action,
      detail: audit.detail,
      createdAt: audit.created_at,
    })),
  };
}

export function createProcessProject(
  input: CreateProcessProjectRequest,
): CreateProcessProjectResponse {
  const template = listProcessTemplates().find((item) => item.id === input.templateId);
  if (!template) throw new Error("Process template not found");

  const now = new Date().toISOString();
  const projectId = `PRJ-${randomUUID().slice(0, 8).toUpperCase()}`;
  const runId = `RUN-${randomUUID().slice(0, 8).toUpperCase()}`;
  let firstStageId: string | null = null;

  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        INSERT INTO process_projects(
          id, name, summary, owner, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, ?)
      `)
      .run(projectId, input.name.trim(), input.summary.trim(), input.owner.trim(), now, now);
    database
      .prepare(`
        INSERT INTO process_runs(
          id, project_id, template_id, template_version, status,
          current_stage_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', NULL, ?, ?)
      `)
      .run(runId, projectId, template.id, template.version, now, now);

    template.stages.forEach((stage, stageIndex) => {
      const stageRunId = `STG-${randomUUID().slice(0, 8).toUpperCase()}`;
      if (stageIndex === 0) firstStageId = stageRunId;
      database
        .prepare(`
          INSERT INTO process_stage_runs(
            id, run_id, template_stage_id, name, summary, status, position, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          stageRunId,
          runId,
          stage.id,
          stage.name,
          stage.summary,
          stageIndex === 0 ? "in_progress" : "pending",
          stage.position,
          now,
        );
      database
        .prepare(`
          INSERT INTO process_gate_decisions(
            id, stage_run_id, decision, note, decided_at, updated_at
          ) VALUES (?, ?, 'pending', '', NULL, ?)
        `)
        .run(`GATE-${randomUUID().slice(0, 8).toUpperCase()}`, stageRunId, now);

      stage.tasks.forEach((task, taskIndex) => {
        database
          .prepare(`
            INSERT INTO process_task_runs(
              id, stage_run_id, template_task_id, title, summary,
              status, assignee, position, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'pending', '', ?, ?)
          `)
          .run(
            `TASK-${randomUUID().slice(0, 8).toUpperCase()}`,
            stageRunId,
            task.id,
            task.title,
            task.summary,
            taskIndex,
            now,
          );
      });
    });
    database
      .prepare("UPDATE process_runs SET current_stage_id = ? WHERE id = ?")
      .run(firstStageId, runId);
    recordAudit("project", projectId, "created", `${template.name} 템플릿으로 프로젝트 생성`, now);
    recordAudit("run", runId, "started", "첫 번째 단계가 시작됨", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  const projectRow = database
    .prepare("SELECT * FROM process_projects WHERE id = ?")
    .get(projectId) as unknown as ProjectRow;
  return { project: toProject(projectRow), run: loadProcessRun(getRunRow(runId)) };
}

export function updateProcessTask(
  runId: string,
  stageId: string,
  taskId: string,
  input: UpdateProcessTaskRequest,
): ProcessRun {
  const run = getRunRow(runId);
  if (run.status === "completed" || run.status === "cancelled") {
    throw new Error("Completed or cancelled run cannot be changed");
  }
  const stage = database
    .prepare("SELECT * FROM process_stage_runs WHERE id = ? AND run_id = ?")
    .get(stageId, runId) as unknown as StageRunRow | undefined;
  if (!stage) throw new Error("Process stage not found");
  if (run.current_stage_id !== stageId) throw new Error("Only the current stage can be changed");
  if (stage.status === "done") throw new Error("Completed stage cannot be changed");
  const task = database
    .prepare("SELECT * FROM process_task_runs WHERE id = ? AND stage_run_id = ?")
    .get(taskId, stageId) as unknown as TaskRunRow | undefined;
  if (!task) throw new Error("Process task not found");

  const now = new Date().toISOString();
  const nextAssignee = input.assignee === undefined ? task.assignee : input.assignee.trim();
  const stageStatus = input.status === "blocked" ? "blocked" : "in_progress";
  const runStatus = input.status === "blocked" ? "blocked" : "active";
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare("UPDATE process_task_runs SET status = ?, assignee = ?, updated_at = ? WHERE id = ?")
      .run(input.status, nextAssignee, now, taskId);
    database
      .prepare("UPDATE process_stage_runs SET status = ?, updated_at = ? WHERE id = ?")
      .run(stageStatus, now, stageId);
    database
      .prepare("UPDATE process_runs SET status = ?, current_stage_id = ?, updated_at = ? WHERE id = ?")
      .run(runStatus, stageId, now, runId);
    database
      .prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?")
      .run(now, run.project_id);
    recordAudit("task", taskId, "status_changed", `${task.title}: ${input.status}`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function updateProcessStage(
  runId: string,
  stageId: string,
  input: UpdateProcessStageRequest,
): ProcessRun {
  const run = getRunRow(runId);
  if (run.status === "completed" || run.status === "cancelled") {
    throw new Error("Completed or cancelled run cannot be changed");
  }
  const stage = database
    .prepare("SELECT * FROM process_stage_runs WHERE id = ? AND run_id = ?")
    .get(stageId, runId) as unknown as StageRunRow | undefined;
  if (!stage) throw new Error("Process stage not found");
  if (run.current_stage_id !== stageId) throw new Error("Only the current stage can be changed");
  if (stage.status === "done") throw new Error("Completed stage cannot be changed");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare("UPDATE process_stage_runs SET status = ?, updated_at = ? WHERE id = ?")
      .run(input.status, now, stageId);
    database
      .prepare("UPDATE process_runs SET status = ?, current_stage_id = ?, updated_at = ? WHERE id = ?")
      .run(input.status === "blocked" ? "blocked" : "active", stageId, now, runId);
    database
      .prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?")
      .run(now, run.project_id);
    recordAudit("stage", stageId, "status_changed", `${stage.name}: ${input.status}`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function decideProcessGate(
  runId: string,
  stageId: string,
  input: DecideProcessGateRequest,
): ProcessRun {
  const run = getRunRow(runId);
  if (run.status === "completed" || run.status === "cancelled") {
    throw new Error("Completed or cancelled run cannot be changed");
  }
  const stage = database
    .prepare("SELECT * FROM process_stage_runs WHERE id = ? AND run_id = ?")
    .get(stageId, runId) as unknown as StageRunRow | undefined;
  if (!stage) throw new Error("Process stage not found");
  if (run.current_stage_id !== stageId) throw new Error("Only the current stage can be changed");
  const taskCount = database
    .prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
      FROM process_task_runs WHERE stage_run_id = ?
    `)
    .get(stageId) as unknown as { total: number; done: number };
  if (input.decision === "go" && taskCount.done !== taskCount.total) {
    throw new Error("All stage tasks must be done before GO");
  }
  if (input.decision !== "go" && !input.note.trim()) {
    throw new Error("HOLD and KILL decisions require a note");
  }

  const now = new Date().toISOString();
  const nextStage = database
    .prepare(`
      SELECT * FROM process_stage_runs
      WHERE run_id = ? AND position > ?
      ORDER BY position LIMIT 1
    `)
    .get(runId, stage.position) as unknown as StageRunRow | undefined;

  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        UPDATE process_gate_decisions
        SET decision = ?, note = ?, decided_at = ?, updated_at = ?
        WHERE stage_run_id = ?
      `)
      .run(input.decision, input.note.trim(), now, now, stageId);

    if (input.decision === "go") {
      database
        .prepare("UPDATE process_stage_runs SET status = 'done', updated_at = ? WHERE id = ?")
        .run(now, stageId);
      if (nextStage) {
        database
          .prepare("UPDATE process_stage_runs SET status = 'in_progress', updated_at = ? WHERE id = ?")
          .run(now, nextStage.id);
        database
          .prepare("UPDATE process_runs SET status = 'active', current_stage_id = ?, updated_at = ? WHERE id = ?")
          .run(nextStage.id, now, runId);
      } else {
        database
          .prepare("UPDATE process_runs SET status = 'completed', current_stage_id = NULL, updated_at = ? WHERE id = ?")
          .run(now, runId);
      }
    } else {
      database
        .prepare("UPDATE process_stage_runs SET status = 'blocked', updated_at = ? WHERE id = ?")
        .run(now, stageId);
      database
        .prepare("UPDATE process_runs SET status = ?, current_stage_id = ?, updated_at = ? WHERE id = ?")
        .run(input.decision === "kill" ? "cancelled" : "blocked", stageId, now, runId);
    }
    database
      .prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?")
      .run(now, run.project_id);
    recordAudit("gate", stageId, `decision_${input.decision}`, input.note.trim() || `${stage.name} Gate 통과`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function loadOperationsOverview(): ProcessOperationsOverview {
  const incidents = listIncidents();
  const resolved = incidents.filter(
    (incident) => incident.status === "resolved" && incident.resolvedAt,
  );
  const mttrHours = resolved.length
    ? resolved.reduce(
        (sum, incident) =>
          sum +
          (Date.parse(incident.resolvedAt ?? incident.updatedAt) -
            Date.parse(incident.occurredAt)) /
            3_600_000,
        0,
      ) / resolved.length
    : null;
  const documentCount = database
    .prepare("SELECT COUNT(*) AS count FROM document_index")
    .get() as unknown as { count: number };
  const syncedAt = database
    .prepare("SELECT value FROM operations_meta WHERE key = ?")
    .get("documents_synced_at") as unknown as { value: string } | undefined;

  return {
    storage: {
      engine: "sqlite",
      durability,
      schemaVersion: 2,
    },
    documents: {
      indexed: documentCount.count,
      syncedAt: syncedAt?.value ?? null,
    },
    incidents: {
      open: incidents.filter((incident) => incident.status === "open").length,
      resolved: resolved.length,
      mttrHours,
      items: incidents,
    },
  };
}

seedDefaultProcessTemplate();
syncDocumentIndex();
