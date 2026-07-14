import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import type {
  CreateProcessProjectRequest,
  CreateProcessProjectResponse,
  CreateProcessEvidenceRequest,
  CreateProcessTemplateRequest,
  MigrateProcessTemplateRequest,
  MigrateProcessTemplateResponse,
  CreateProcessIncidentRequest,
  DecideProcessGateRequest,
  ProcessAuditEvent,
  ProcessDeliverableRun,
  ProcessEvidence,
  ProcessGateDecision,
  ProcessIncident,
  ProcessOperationsOverview,
  ProcessProjectBrief,
  ProcessDesignPack,
  ProcessDesignJob,
  ProcessProjectExportBundle,
  ProcessProject,
  ProcessRun,
  ProcessStageRun,
  ProcessTaskRun,
  ProcessTemplate,
  ProcessWorkspaceOverview,
  UpdateProcessStageRequest,
  UpdateProcessDeliverableRequest,
  UpdateProcessDesignPackRequest,
  UpdateProcessProjectBriefRequest,
  SubmitProcessDesignJobRequest,
  RequestProcessDesignChangesRequest,
  UpdateProcessTaskRequest,
} from "@goodz/process";

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const repoRoot = process.env.GOODZ_WORKSPACE_ROOT
  ? path.resolve(process.env.GOODZ_WORKSPACE_ROOT)
  : sourceRoot;
const docsRoot = path.join(repoRoot, "docs");
const workspaceTemplatesRoot = path.join(repoRoot, "templates/process");
const templatesRoot = fs.existsSync(workspaceTemplatesRoot)
  ? workspaceTemplatesRoot
  : path.join(sourceRoot, "templates/process");
const workspaceIdentityPath = path.join(repoRoot, ".goodz/workspace.json");

function resolveWorkspaceDatabasePath() {
  if (!fs.existsSync(workspaceIdentityPath)) {
    return path.join(repoRoot, ".goodz/data/goodz.db");
  }
  const workspace = JSON.parse(fs.readFileSync(workspaceIdentityPath, "utf8")) as {
    storage?: { engine?: string; path?: string };
  };
  if (workspace.storage?.engine !== "sqlite" || !workspace.storage.path) {
    throw new Error(".goodz/workspace.json requires a SQLite storage path");
  }
  const resolved = path.resolve(repoRoot, workspace.storage.path);
  if (resolved !== repoRoot && !resolved.startsWith(`${repoRoot}${path.sep}`)) {
    throw new Error("Workspace database path must stay inside the repository");
  }
  return resolved;
}

const defaultDatabasePath = resolveWorkspaceDatabasePath();
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

  CREATE TABLE IF NOT EXISTS process_template_deliverables (
    id TEXT PRIMARY KEY,
    stage_id TEXT NOT NULL REFERENCES process_template_stages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    required INTEGER NOT NULL CHECK (required IN (0, 1)),
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

  CREATE TABLE IF NOT EXISTS process_project_briefs (
    project_id TEXT PRIMARY KEY REFERENCES process_projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'approved')),
    problem TEXT NOT NULL,
    target_users TEXT NOT NULL,
    value_proposition TEXT NOT NULL,
    mvp_scope TEXT NOT NULL,
    out_of_scope TEXT NOT NULL,
    success_metrics TEXT NOT NULL,
    constraints TEXT NOT NULL,
    approved_at TEXT,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_design_packs (
    project_id TEXT PRIMARY KEY REFERENCES process_projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'approved')),
    concept_name TEXT NOT NULL,
    mood TEXT NOT NULL,
    palette TEXT NOT NULL,
    typography TEXT NOT NULL,
    screens_json TEXT NOT NULL,
    storyboard_json TEXT NOT NULL,
    handoff_url TEXT NOT NULL,
    approved_at TEXT,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_design_jobs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES process_projects(id) ON DELETE CASCADE,
    connector TEXT NOT NULL CHECK (connector IN ('manual_claude_design')),
    status TEXT NOT NULL CHECK (status IN ('queued', 'in_progress', 'submitted', 'changes_requested', 'approved')),
    prompt_snapshot TEXT NOT NULL,
    result_url TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL,
    started_at TEXT,
    submitted_at TEXT,
    approved_at TEXT,
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

  CREATE TABLE IF NOT EXISTS process_deliverable_runs (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    template_deliverable_id TEXT NOT NULL REFERENCES process_template_deliverables(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    required INTEGER NOT NULL CHECK (required IN (0, 1)),
    status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'approved', 'changes_requested')),
    owner TEXT NOT NULL,
    uri TEXT NOT NULL,
    note TEXT NOT NULL,
    position INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(stage_run_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_evidence (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('document', 'issue', 'pr', 'commit', 'ci', 'release', 'link')),
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL
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
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'run', 'stage', 'task', 'gate', 'template', 'deliverable', 'evidence', 'design_job')),
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (1, datetime('now'));

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (2, datetime('now'));

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (3, datetime('now'));

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (4, datetime('now'));

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (5, datetime('now'));
`);

const auditSchema = database
  .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'process_audit_events'")
  .get() as unknown as { sql: string };
if (!auditSchema.sql.includes("'design_job'")) {
  database.exec(`
    BEGIN IMMEDIATE;
    ALTER TABLE process_audit_events RENAME TO process_audit_events_v2;
    CREATE TABLE process_audit_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'run', 'stage', 'task', 'gate', 'template', 'deliverable', 'evidence', 'design_job')),
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT;
    INSERT INTO process_audit_events SELECT * FROM process_audit_events_v2;
    DROP TABLE process_audit_events_v2;
    COMMIT;
  `);
}

interface TemplateDefinition extends CreateProcessTemplateRequest {
  id: string;
  version: number;
}

function insertProcessTemplate(definition: TemplateDefinition, ignoreExisting: boolean) {
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        INSERT ${ignoreExisting ? "OR IGNORE" : ""} INTO process_templates(id, name, version, summary, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(definition.id, definition.name.trim(), definition.version, definition.summary.trim(), now);

    definition.stages.forEach((stage, stageIndex) => {
      const stageId = `${definition.id}-${stage.code.trim().toUpperCase()}`;
      database
        .prepare(`
          INSERT OR IGNORE INTO process_template_stages(
            id, template_id, code, name, summary, position
          ) VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          stageId,
          definition.id,
          stage.code,
          stage.name,
          stage.summary,
          stageIndex,
        );

      stage.tasks.forEach((task, taskIndex) => {
        database
          .prepare(`
            INSERT OR IGNORE INTO process_template_tasks(
              id, stage_id, title, summary, position
            ) VALUES (?, ?, ?, ?, ?)
          `)
          .run(
            `${stageId}-T${taskIndex + 1}`,
            stageId,
            task.title.trim(),
            task.summary.trim(),
            taskIndex,
          );
      });
      stage.deliverables.forEach((deliverable, deliverableIndex) => {
        database
          .prepare(`
            INSERT OR IGNORE INTO process_template_deliverables(
              id, stage_id, title, summary, required, position
            ) VALUES (?, ?, ?, ?, ?, ?)
          `)
          .run(
            `${stageId}-D${deliverableIndex + 1}`,
            stageId,
            deliverable.title.trim(),
            deliverable.summary.trim(),
            deliverable.required ? 1 : 0,
            deliverableIndex,
          );
      });
    });
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function seedProcessTemplates() {
  const files = fs.readdirSync(templatesRoot).filter((file) => file.endsWith(".json")).sort();
  for (const file of files) {
    const definition = JSON.parse(
      fs.readFileSync(path.join(templatesRoot, file), "utf8"),
    ) as TemplateDefinition;
    insertProcessTemplate(definition, true);
  }
}

function backfillProcessDeliverables() {
  const missing = database
    .prepare(`
      SELECT sr.id AS stage_run_id, td.*
      FROM process_stage_runs sr
      JOIN process_template_deliverables td ON td.stage_id = sr.template_stage_id
      LEFT JOIN process_deliverable_runs dr
        ON dr.stage_run_id = sr.id AND dr.template_deliverable_id = td.id
      WHERE dr.id IS NULL
      ORDER BY sr.id, td.position
    `)
    .all() as unknown as Array<TemplateDeliverableRow & { stage_run_id: string }>;
  const now = new Date().toISOString();
  const insert = database.prepare(`
    INSERT INTO process_deliverable_runs(
      id, stage_run_id, template_deliverable_id, title, summary,
      required, status, owner, uri, note, position, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', '', '', '', ?, ?)
  `);
  database.exec("BEGIN IMMEDIATE");
  try {
    for (const deliverable of missing) {
      insert.run(
        `DEL-${randomUUID().slice(0, 8).toUpperCase()}`,
        deliverable.stage_run_id,
        deliverable.id,
        deliverable.title,
        deliverable.summary,
        deliverable.required,
        deliverable.position,
        now,
      );
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function backfillProjectWorkbenches() {
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      INSERT OR IGNORE INTO process_project_briefs(
        project_id, status, problem, target_users, value_proposition,
        mvp_scope, out_of_scope, success_metrics, constraints, approved_at, updated_at
      )
      SELECT id, 'draft', '', '', '', '', '', '', '', NULL, ? FROM process_projects
    `).run(now);
    database.prepare(`
      INSERT OR IGNORE INTO process_design_packs(
        project_id, status, concept_name, mood, palette, typography,
        screens_json, storyboard_json, handoff_url, approved_at, updated_at
      )
      SELECT id, 'draft', '', '', '', '', '[]', '[]', '', NULL, ? FROM process_projects
    `).run(now);
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
  code: string;
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

interface TemplateDeliverableRow {
  id: string;
  stage_id: string;
  title: string;
  summary: string;
  required: number;
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

interface BriefRow {
  project_id: string;
  status: ProcessProjectBrief["status"];
  problem: string;
  target_users: string;
  value_proposition: string;
  mvp_scope: string;
  out_of_scope: string;
  success_metrics: string;
  constraints: string;
  approved_at: string | null;
  updated_at: string;
}

interface DesignPackRow {
  project_id: string;
  status: ProcessDesignPack["status"];
  concept_name: string;
  mood: string;
  palette: string;
  typography: string;
  screens_json: string;
  storyboard_json: string;
  handoff_url: string;
  approved_at: string | null;
  updated_at: string;
}

interface DesignJobRow {
  id: string;
  project_id: string;
  connector: ProcessDesignJob["connector"];
  status: ProcessDesignJob["status"];
  prompt_snapshot: string;
  result_url: string;
  note: string;
  created_at: string;
  started_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
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

interface DeliverableRunRow {
  id: string;
  stage_run_id: string;
  template_deliverable_id: string;
  title: string;
  summary: string;
  required: number;
  status: ProcessDeliverableRun["status"];
  owner: string;
  uri: string;
  note: string;
  position: number;
  updated_at: string;
}

interface EvidenceRow {
  id: string;
  stage_run_id: string;
  type: ProcessEvidence["type"];
  label: string;
  url: string;
  summary: string;
  created_at: string;
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
  const deliverables = database
    .prepare("SELECT * FROM process_template_deliverables ORDER BY stage_id, position")
    .all() as unknown as TemplateDeliverableRow[];

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
        code: stage.code,
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
        deliverables: deliverables
          .filter((deliverable) => deliverable.stage_id === stage.id)
          .map((deliverable) => ({
            id: deliverable.id,
            title: deliverable.title,
            summary: deliverable.summary,
            required: deliverable.required === 1,
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

function markdownList(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => `- ${line}`).join("\n");
}

function buildBriefMarkdown(project: ProcessProject, row: BriefRow) {
  return `# ${project.name} PRD\n\n> ${project.summary}\n\n## 문제 정의\n\n${row.problem}\n\n## 타깃 사용자\n\n${row.target_users}\n\n## 핵심 가치\n\n${row.value_proposition}\n\n## MVP 범위\n\n${markdownList(row.mvp_scope)}\n\n## 비목표\n\n${markdownList(row.out_of_scope)}\n\n## 성공 지표\n\n${markdownList(row.success_metrics)}\n\n## 제약과 가정\n\n${markdownList(row.constraints)}\n`;
}

function toBrief(row: BriefRow, project: ProcessProject): ProcessProjectBrief {
  return {
    projectId: row.project_id,
    status: row.status,
    problem: row.problem,
    targetUsers: row.target_users,
    valueProposition: row.value_proposition,
    mvpScope: row.mvp_scope,
    outOfScope: row.out_of_scope,
    successMetrics: row.success_metrics,
    constraints: row.constraints,
    markdown: buildBriefMarkdown(project, row),
    ...(row.approved_at ? { approvedAt: row.approved_at } : {}),
    updatedAt: row.updated_at,
  };
}

function buildHandoffPrompt(project: ProcessProject, brief: ProcessProjectBrief, row: DesignPackRow) {
  const screens = JSON.parse(row.screens_json) as ProcessDesignPack["screens"];
  const storyboard = JSON.parse(row.storyboard_json) as ProcessDesignPack["storyboard"];
  const screenText = screens.map((screen, index) => `${index + 1}. ${screen.name}\n   목적: ${screen.purpose}\n   섹션: ${screen.sections}\n   주요 행동: ${screen.primaryAction}`).join("\n");
  const storyText = storyboard.map((step, index) => `${index + 1}. ${step.actor}가 ${step.screen}에서 ${step.action}하여 ${step.outcome}`).join("\n");
  return `Claude Design에서 ${project.name}의 high-fidelity MVP를 제작하세요.\n\n[제품]\n${project.summary}\n\n[문제]\n${brief.problem}\n\n[사용자]\n${brief.targetUsers}\n\n[핵심 가치]\n${brief.valueProposition}\n\n[디자인 콘셉트]\n- 방향: ${row.concept_name}\n- 무드: ${row.mood}\n- 팔레트: ${row.palette}\n- 타이포그래피: ${row.typography}\n\n[화면 명세]\n${screenText}\n\n[스토리보드]\n${storyText}\n\n각 화면에 loading, empty, error, success 상태를 포함하고 재사용 가능한 컴포넌트와 반응형 규칙을 명시하세요.`;
}

function toDesignPack(row: DesignPackRow, project: ProcessProject, brief: ProcessProjectBrief): ProcessDesignPack {
  return {
    projectId: row.project_id,
    status: row.status,
    conceptName: row.concept_name,
    mood: row.mood,
    palette: row.palette,
    typography: row.typography,
    screens: JSON.parse(row.screens_json) as ProcessDesignPack["screens"],
    storyboard: JSON.parse(row.storyboard_json) as ProcessDesignPack["storyboard"],
    handoffPrompt: buildHandoffPrompt(project, brief, row),
    handoffUrl: row.handoff_url,
    ...(row.approved_at ? { approvedAt: row.approved_at } : {}),
    updatedAt: row.updated_at,
  };
}

function toDesignJob(row: DesignJobRow): ProcessDesignJob {
  return {
    id: row.id,
    projectId: row.project_id,
    connector: row.connector,
    status: row.status,
    promptSnapshot: row.prompt_snapshot,
    resultUrl: row.result_url,
    note: row.note,
    createdAt: row.created_at,
    ...(row.started_at ? { startedAt: row.started_at } : {}),
    ...(row.submitted_at ? { submittedAt: row.submitted_at } : {}),
    ...(row.approved_at ? { approvedAt: row.approved_at } : {}),
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
      const deliverables = database
        .prepare("SELECT * FROM process_deliverable_runs WHERE stage_run_id = ? ORDER BY position")
        .all(stage.id) as unknown as DeliverableRunRow[];
      const evidence = database
        .prepare("SELECT * FROM process_evidence WHERE stage_run_id = ? ORDER BY created_at DESC")
        .all(stage.id) as unknown as EvidenceRow[];
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
        deliverables: deliverables.map((deliverable) => ({
          id: deliverable.id,
          templateDeliverableId: deliverable.template_deliverable_id,
          title: deliverable.title,
          summary: deliverable.summary,
          required: deliverable.required === 1,
          status: deliverable.status,
          owner: deliverable.owner,
          uri: deliverable.uri,
          note: deliverable.note,
          position: deliverable.position,
          updatedAt: deliverable.updated_at,
        })),
        evidence: evidence.map((item) => ({
          id: item.id,
          type: item.type,
          label: item.label,
          url: item.url,
          summary: item.summary,
          createdAt: item.created_at,
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
  const projectItems = projects.map(toProject);
  const briefs = database.prepare("SELECT * FROM process_project_briefs ORDER BY updated_at DESC").all() as unknown as BriefRow[];
  const designPacks = database.prepare("SELECT * FROM process_design_packs ORDER BY updated_at DESC").all() as unknown as DesignPackRow[];
  const designJobs = database.prepare("SELECT * FROM process_design_jobs ORDER BY created_at DESC").all() as unknown as DesignJobRow[];
  const briefItems = briefs.map((brief) => {
    const project = projectItems.find((item) => item.id === brief.project_id);
    if (!project) throw new Error("Brief project not found");
    return toBrief(brief, project);
  });

  return {
    templates: listProcessTemplates(),
    projects: projectItems,
    runs: runs.map(loadProcessRun),
    briefs: briefItems,
    designPacks: designPacks.map((designPack) => {
      const project = projectItems.find((item) => item.id === designPack.project_id);
      const brief = briefItems.find((item) => item.projectId === designPack.project_id);
      if (!project || !brief) throw new Error("Design pack project or brief not found");
      return toDesignPack(designPack, project, brief);
    }),
    designJobs: designJobs.map(toDesignJob),
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

export function createProcessTemplate(
  input: CreateProcessTemplateRequest,
): ProcessTemplate {
  if (input.stages.length === 0) throw new Error("At least one stage is required");
  if (input.stages.length > 20) throw new Error("A template can contain up to 20 stages");
  if (input.stages.some((stage) => !stage || !Array.isArray(stage.tasks) || !Array.isArray(stage.deliverables))) {
    throw new Error("Every stage requires task and deliverable arrays");
  }
  if (input.name.trim().length > 80 || input.summary.trim().length > 240) {
    throw new Error("Template name or summary is too long");
  }
  const codes = input.stages.map((stage) => stage.code.trim().toUpperCase());
  if (codes.some((code) => !/^[A-Z][A-Z0-9_-]{0,15}$/.test(code))) {
    throw new Error("Stage codes must use 1-16 uppercase letters, numbers, _ or -");
  }
  if (new Set(codes).size !== codes.length) throw new Error("Stage codes must be unique");
  if (input.stages.some((stage) => !stage.name.trim() || !stage.summary.trim() || stage.tasks.length === 0)) {
    throw new Error("Every stage requires a name, summary, and at least one task");
  }
  if (input.stages.some((stage) => stage.name.trim().length > 80 || stage.summary.trim().length > 240)) {
    throw new Error("Stage name or summary is too long");
  }
  if (input.stages.some((stage) => stage.tasks.length > 50 || stage.deliverables.length > 20)) {
    throw new Error("Each stage supports up to 50 tasks and 20 deliverables");
  }
  if (input.stages.some((stage) =>
    stage.tasks.some((task) => !task.title.trim() || !task.summary.trim()) ||
    stage.deliverables.some((deliverable) => !deliverable.title.trim() || !deliverable.summary.trim())
  )) {
    throw new Error("Every task and deliverable requires a title and summary");
  }
  if (input.stages.some((stage) =>
    stage.tasks.some((task) => task.title.trim().length > 120 || task.summary.trim().length > 240) ||
    stage.deliverables.some((item) => item.title.trim().length > 120 || item.summary.trim().length > 240)
  )) {
    throw new Error("Task or deliverable content is too long");
  }
  const definition: TemplateDefinition = {
    ...input,
    id: `TPL-${randomUUID().slice(0, 8).toUpperCase()}-V1`,
    version: 1,
  };
  insertProcessTemplate(definition, false);
  recordAudit("template", definition.id, "created", `${definition.name} 템플릿 생성`);
  const template = listProcessTemplates().find((item) => item.id === definition.id);
  if (!template) throw new Error("Created template could not be loaded");
  return template;
}

export function migrateProcessTemplate(
  templateId: string,
  input: MigrateProcessTemplateRequest,
): MigrateProcessTemplateResponse {
  const source = listProcessTemplates().find((item) => item.id === templateId);
  if (!source) throw new Error("Process template not found");
  const lineage = source.id.match(/^(.*)-V(\d+)$/);
  if (!lineage?.[1]) throw new Error("Template id does not contain a version suffix");
  const name = input.name?.trim() || source.name;
  const summary = input.summary?.trim() || source.summary;
  if (name.length > 80 || summary.length > 240) throw new Error("Template name or summary is too long");
  const versions = listProcessTemplates()
    .filter((item) => item.id.startsWith(`${lineage[1]}-V`))
    .map((item) => item.version);
  const version = Math.max(...versions) + 1;
  const definition: TemplateDefinition = {
    id: `${lineage[1]}-V${version}`,
    version,
    name,
    summary,
    stages: source.stages.map((stage) => ({
      code: stage.code,
      name: stage.name,
      summary: stage.summary,
      tasks: stage.tasks.map((task) => ({ title: task.title, summary: task.summary })),
      deliverables: stage.deliverables.map((deliverable) => ({
        title: deliverable.title,
        summary: deliverable.summary,
        required: deliverable.required,
      })),
    })),
  };
  insertProcessTemplate(definition, false);
  recordAudit("template", definition.id, "version_migrated", `${source.id} → ${definition.id}`);
  const target = listProcessTemplates().find((item) => item.id === definition.id);
  if (!target) throw new Error("Migrated template could not be loaded");
  return { source, target };
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
    database.prepare(`
      INSERT INTO process_project_briefs(
        project_id, status, problem, target_users, value_proposition,
        mvp_scope, out_of_scope, success_metrics, constraints, approved_at, updated_at
      ) VALUES (?, 'draft', '', '', '', '', '', '', '', NULL, ?)
    `).run(projectId, now);
    database.prepare(`
      INSERT INTO process_design_packs(
        project_id, status, concept_name, mood, palette, typography,
        screens_json, storyboard_json, handoff_url, approved_at, updated_at
      ) VALUES (?, 'draft', '', '', '', '', '[]', '[]', '', NULL, ?)
    `).run(projectId, now);
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
      stage.deliverables.forEach((deliverable, deliverableIndex) => {
        database
          .prepare(`
            INSERT INTO process_deliverable_runs(
              id, stage_run_id, template_deliverable_id, title, summary,
              required, status, owner, uri, note, position, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', '', '', '', ?, ?)
          `)
          .run(
            `DEL-${randomUUID().slice(0, 8).toUpperCase()}`,
            stageRunId,
            deliverable.id,
            deliverable.title,
            deliverable.summary,
            deliverable.required ? 1 : 0,
            deliverableIndex,
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

function getProject(projectId: string) {
  const row = database.prepare("SELECT * FROM process_projects WHERE id = ?").get(projectId) as unknown as ProjectRow | undefined;
  if (!row) throw new Error("Process project not found");
  return toProject(row);
}

function invalidateOpenDesignJobs(projectId: string, reason: string, updatedAt: string) {
  database.prepare(`
    UPDATE process_design_jobs
    SET status = 'changes_requested', note = ?, updated_at = ?
    WHERE project_id = ? AND status IN ('queued', 'in_progress', 'submitted')
  `).run(reason, updatedAt, projectId);
}

export function updateProcessProjectBrief(
  projectId: string,
  input: UpdateProcessProjectBriefRequest,
): ProcessProjectBrief {
  const project = getProject(projectId);
  const values = [input.problem, input.targetUsers, input.valueProposition, input.mvpScope, input.outOfScope, input.successMetrics, input.constraints];
  if (values.some((value) => typeof value !== "string")) throw new Error("All PRD fields must be strings");
  if (values.some((value) => value.trim().length > 4_000)) throw new Error("A PRD field can contain up to 4,000 characters");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      UPDATE process_project_briefs SET
        status = 'draft', problem = ?, target_users = ?, value_proposition = ?,
        mvp_scope = ?, out_of_scope = ?, success_metrics = ?, constraints = ?,
        approved_at = NULL, updated_at = ?
      WHERE project_id = ?
    `).run(...values.map((value) => value.trim()), now, projectId);
    database.prepare(`
      UPDATE process_design_packs
      SET status = 'draft', approved_at = NULL, updated_at = ?
      WHERE project_id = ?
    `).run(now, projectId);
    invalidateOpenDesignJobs(projectId, "PRD가 변경되어 새 handoff가 필요합니다.", now);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, projectId);
    recordAudit("project", projectId, "brief_saved", "PRD Wizard 초안 저장", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  const row = database.prepare("SELECT * FROM process_project_briefs WHERE project_id = ?").get(projectId) as unknown as BriefRow;
  return toBrief(row, project);
}

export function approveProcessProjectBrief(projectId: string): ProcessProjectBrief {
  const project = getProject(projectId);
  const row = database.prepare("SELECT * FROM process_project_briefs WHERE project_id = ?").get(projectId) as unknown as BriefRow | undefined;
  if (!row) throw new Error("Project brief not found");
  const required = [row.problem, row.target_users, row.value_proposition, row.mvp_scope, row.out_of_scope, row.success_metrics, row.constraints];
  if (required.some((value) => !value.trim())) throw new Error("Complete every PRD field before approval");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare("UPDATE process_project_briefs SET status = 'approved', approved_at = ?, updated_at = ? WHERE project_id = ?").run(now, now, projectId);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, projectId);
    recordAudit("project", projectId, "brief_approved", "PRD 승인 및 Design Workbench 준비", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  const approved = database.prepare("SELECT * FROM process_project_briefs WHERE project_id = ?").get(projectId) as unknown as BriefRow;
  return toBrief(approved, project);
}

export function updateProcessDesignPack(
  projectId: string,
  input: UpdateProcessDesignPackRequest,
): ProcessDesignPack {
  const project = getProject(projectId);
  const briefRow = database.prepare("SELECT * FROM process_project_briefs WHERE project_id = ?").get(projectId) as unknown as BriefRow | undefined;
  if (!briefRow) throw new Error("Project brief not found");
  if (!Array.isArray(input.screens) || !Array.isArray(input.storyboard)) throw new Error("Screens and storyboard must be arrays");
  if (input.screens.length > 30 || input.storyboard.length > 50) throw new Error("Design Pack supports up to 30 screens and 50 storyboard steps");
  const textValues = [input.conceptName, input.mood, input.palette, input.typography, input.handoffUrl];
  if (textValues.some((value) => typeof value !== "string" || value.trim().length > 2_000)) throw new Error("Invalid Design Pack text field");
  if (input.screens.some((screen) => !screen.name?.trim() || !screen.purpose?.trim() || !screen.sections?.trim() || !screen.primaryAction?.trim())) throw new Error("Every screen field is required");
  if (input.storyboard.some((step) => !step.actor?.trim() || !step.action?.trim() || !step.screen?.trim() || !step.outcome?.trim())) throw new Error("Every storyboard field is required");
  if (
    input.screens.some((screen) => Object.values(screen).some((value) => value.trim().length > 1_000)) ||
    input.storyboard.some((step) => Object.values(step).some((value) => value.trim().length > 1_000))
  ) throw new Error("A screen or storyboard field can contain up to 1,000 characters");
  const screens: ProcessDesignPack["screens"] = input.screens.map((screen) => ({ ...screen, id: `SCR-${randomUUID().slice(0, 8).toUpperCase()}` }));
  const storyboard: ProcessDesignPack["storyboard"] = input.storyboard.map((step) => ({ ...step, id: `STORY-${randomUUID().slice(0, 8).toUpperCase()}` }));
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      UPDATE process_design_packs SET
        status = 'draft', concept_name = ?, mood = ?, palette = ?, typography = ?,
        screens_json = ?, storyboard_json = ?, handoff_url = ?, approved_at = NULL, updated_at = ?
      WHERE project_id = ?
    `).run(
      input.conceptName.trim(), input.mood.trim(), input.palette.trim(), input.typography.trim(),
      JSON.stringify(screens), JSON.stringify(storyboard), input.handoffUrl.trim(), now, projectId,
    );
    invalidateOpenDesignJobs(projectId, "Design Pack이 변경되어 새 handoff가 필요합니다.", now);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, projectId);
    recordAudit("project", projectId, "design_pack_saved", "화면·스토리보드·콘셉트와 Claude handoff 저장", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  const designRow = database.prepare("SELECT * FROM process_design_packs WHERE project_id = ?").get(projectId) as unknown as DesignPackRow;
  return toDesignPack(designRow, project, toBrief(briefRow, project));
}

function assertDesignPackReady(designRow: DesignPackRow) {
  const screens = JSON.parse(designRow.screens_json) as ProcessDesignPack["screens"];
  const storyboard = JSON.parse(designRow.storyboard_json) as ProcessDesignPack["storyboard"];
  if (
    !designRow.concept_name ||
    !designRow.mood ||
    !designRow.palette ||
    !designRow.typography ||
    screens.length === 0 ||
    storyboard.length === 0
  ) {
    throw new Error("Complete the concept, screens, and storyboard before creating a Design Job");
  }
}

function getDesignJob(projectId: string, jobId: string) {
  const row = database.prepare("SELECT * FROM process_design_jobs WHERE id = ? AND project_id = ?").get(jobId, projectId) as unknown as DesignJobRow | undefined;
  if (!row) throw new Error("Design Job not found");
  return row;
}

export function createProcessDesignJob(projectId: string): ProcessDesignJob {
  const project = getProject(projectId);
  const briefRow = database.prepare("SELECT * FROM process_project_briefs WHERE project_id = ?").get(projectId) as unknown as BriefRow | undefined;
  const designRow = database.prepare("SELECT * FROM process_design_packs WHERE project_id = ?").get(projectId) as unknown as DesignPackRow | undefined;
  if (!briefRow || !designRow) throw new Error("Project workbench not found");
  if (briefRow.status !== "approved") throw new Error("Approve the PRD before creating a Design Job");
  assertDesignPackReady(designRow);
  const openJob = database.prepare(`
    SELECT id FROM process_design_jobs
    WHERE project_id = ? AND status IN ('queued', 'in_progress', 'submitted')
    LIMIT 1
  `).get(projectId) as unknown as { id: string } | undefined;
  if (openJob) throw new Error("Finish or request changes on the current Design Job first");

  const now = new Date().toISOString();
  const id = `DJOB-${randomUUID().slice(0, 8).toUpperCase()}`;
  const brief = toBrief(briefRow, project);
  const prompt = buildHandoffPrompt(project, brief, designRow);
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      INSERT INTO process_design_jobs(
        id, project_id, connector, status, prompt_snapshot, result_url, note,
        created_at, started_at, submitted_at, approved_at, updated_at
      ) VALUES (?, ?, 'manual_claude_design', 'queued', ?, '', '', ?, NULL, NULL, NULL, ?)
    `).run(id, projectId, prompt, now, now);
    recordAudit("design_job", id, "queued", `${project.name} Claude Design handoff 생성`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return toDesignJob(getDesignJob(projectId, id));
}

export function startProcessDesignJob(projectId: string, jobId: string): ProcessDesignJob {
  const job = getDesignJob(projectId, jobId);
  if (job.status !== "queued") throw new Error("Only a queued Design Job can be started");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      UPDATE process_design_jobs
      SET status = 'in_progress', started_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, jobId);
    recordAudit("design_job", jobId, "started", "Claude Design 수동 실행 시작", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return toDesignJob(getDesignJob(projectId, jobId));
}

export function submitProcessDesignJob(
  projectId: string,
  jobId: string,
  input: SubmitProcessDesignJobRequest,
): ProcessDesignJob {
  const job = getDesignJob(projectId, jobId);
  if (job.status !== "in_progress") throw new Error("Only an in-progress Design Job can submit a result");
  const resultUrl = input.resultUrl?.trim();
  const note = input.note?.trim() ?? "";
  if (!resultUrl || !resultUrl.startsWith("https://claude.ai/")) {
    throw new Error("A valid https://claude.ai/ result URL is required");
  }
  if (resultUrl.length > 2_000 || note.length > 4_000) throw new Error("Design result URL or note is too long");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      UPDATE process_design_jobs
      SET status = 'submitted', result_url = ?, note = ?, submitted_at = ?, updated_at = ?
      WHERE id = ?
    `).run(resultUrl, note, now, now, jobId);
    database.prepare(`
      UPDATE process_design_packs
      SET status = 'draft', handoff_url = ?, approved_at = NULL, updated_at = ?
      WHERE project_id = ?
    `).run(resultUrl, now, projectId);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, projectId);
    recordAudit("design_job", jobId, "submitted", "Claude Design 결과 URL 제출", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return toDesignJob(getDesignJob(projectId, jobId));
}

export function requestProcessDesignChanges(
  projectId: string,
  jobId: string,
  input: RequestProcessDesignChangesRequest,
): ProcessDesignJob {
  const job = getDesignJob(projectId, jobId);
  if (job.status !== "submitted") throw new Error("Only a submitted Design Job can request changes");
  const note = input.note?.trim();
  if (!note) throw new Error("A change request note is required");
  if (note.length > 4_000) throw new Error("Change request note is too long");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      UPDATE process_design_jobs
      SET status = 'changes_requested', note = ?, updated_at = ?
      WHERE id = ?
    `).run(note, now, jobId);
    database.prepare("UPDATE process_design_packs SET status = 'draft', approved_at = NULL, updated_at = ? WHERE project_id = ?").run(now, projectId);
    recordAudit("design_job", jobId, "changes_requested", note, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return toDesignJob(getDesignJob(projectId, jobId));
}

export function approveProcessDesignPack(projectId: string): ProcessDesignPack {
  const project = getProject(projectId);
  const briefRow = database.prepare("SELECT * FROM process_project_briefs WHERE project_id = ?").get(projectId) as unknown as BriefRow | undefined;
  const designRow = database.prepare("SELECT * FROM process_design_packs WHERE project_id = ?").get(projectId) as unknown as DesignPackRow | undefined;
  if (!briefRow || !designRow) throw new Error("Project workbench not found");
  if (briefRow.status !== "approved") throw new Error("Approve the PRD before the Design Pack");
  assertDesignPackReady(designRow);
  const submittedJob = database.prepare(`
    SELECT * FROM process_design_jobs
    WHERE project_id = ? AND status = 'submitted'
    ORDER BY submitted_at DESC LIMIT 1
  `).get(projectId) as unknown as DesignJobRow | undefined;
  if (!submittedJob || !submittedJob.result_url) throw new Error("Submit a Claude Design Job result before approval");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare("UPDATE process_design_packs SET status = 'approved', handoff_url = ?, approved_at = ?, updated_at = ? WHERE project_id = ?").run(submittedJob.result_url, now, now, projectId);
    database.prepare("UPDATE process_design_jobs SET status = 'approved', approved_at = ?, updated_at = ? WHERE id = ?").run(now, now, submittedJob.id);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, projectId);
    recordAudit("design_job", submittedJob.id, "approved", "Claude Design 결과 승인", now);
    recordAudit("project", projectId, "design_pack_approved", "Claude Design 결과와 handoff 승인", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  const approved = database.prepare("SELECT * FROM process_design_packs WHERE project_id = ?").get(projectId) as unknown as DesignPackRow;
  return toDesignPack(approved, project, toBrief(briefRow, project));
}

export function exportProcessProject(projectId: string): ProcessProjectExportBundle {
  const project = getProject(projectId);
  const briefRow = database.prepare("SELECT * FROM process_project_briefs WHERE project_id = ?").get(projectId) as unknown as BriefRow | undefined;
  const designRow = database.prepare("SELECT * FROM process_design_packs WHERE project_id = ?").get(projectId) as unknown as DesignPackRow | undefined;
  const approvedJob = database.prepare(`
    SELECT * FROM process_design_jobs
    WHERE project_id = ? AND status = 'approved'
    ORDER BY approved_at DESC LIMIT 1
  `).get(projectId) as unknown as DesignJobRow | undefined;
  if (!briefRow || !designRow) throw new Error("Project workbench not found");
  if (briefRow.status !== "approved" || designRow.status !== "approved" || !approvedJob) {
    throw new Error("Approve the PRD and Claude Design result before export");
  }
  const brief = toBrief(briefRow, project);
  const design = toDesignPack(designRow, project, brief);
  const root = `docs/projects/${project.id.toLowerCase()}`;
  const screenRows = design.screens.map((screen, index) => `| S${index + 1} | ${screen.name} | ${screen.purpose} | ${screen.sections} | ${screen.primaryAction} |`).join("\n");
  const storyRows = design.storyboard.map((step, index) => `${index + 1}. **${step.actor}** · ${step.screen}에서 ${step.action} → ${step.outcome}`).join("\n");
  const designMarkdown = `# ${project.name} Design Pack\n\n## 콘셉트\n\n- 방향: ${design.conceptName}\n- 무드: ${design.mood}\n- 팔레트: ${design.palette}\n- 타이포그래피: ${design.typography}\n\n## 화면\n\n| ID | 화면 | 목적 | 섹션 | 주요 행동 |\n|---|---|---|---|---|\n${screenRows}\n\n## 스토리보드\n\n${storyRows}\n\n## Claude Design 결과\n\n${approvedJob.result_url}\n`;
  const handoffMarkdown = `# Claude Design Handoff\n\n## 상태\n\n- Connector: manual_claude_design\n- Job: ${approvedJob.id}\n- Result: ${approvedJob.result_url}\n- Approved: ${approvedJob.approved_at ?? ""}\n\n## Prompt snapshot\n\n\`\`\`text\n${approvedJob.prompt_snapshot}\n\`\`\`\n`;
  return {
    schemaVersion: 1,
    projectId,
    projectName: project.name,
    generatedAt: new Date().toISOString(),
    files: [
      { path: `${root}/PRD.md`, mediaType: "text/markdown", content: brief.markdown },
      { path: `${root}/DESIGN_PACK.md`, mediaType: "text/markdown", content: designMarkdown },
      { path: `${root}/CLAUDE_DESIGN_HANDOFF.md`, mediaType: "text/markdown", content: handoffMarkdown },
    ],
  };
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

function assertCurrentMutableStage(runId: string, stageId: string) {
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
  return { run, stage };
}

export function updateProcessDeliverable(
  runId: string,
  stageId: string,
  deliverableId: string,
  input: UpdateProcessDeliverableRequest,
): ProcessRun {
  const { run } = assertCurrentMutableStage(runId, stageId);
  const deliverable = database
    .prepare("SELECT * FROM process_deliverable_runs WHERE id = ? AND stage_run_id = ?")
    .get(deliverableId, stageId) as unknown as DeliverableRunRow | undefined;
  if (!deliverable) throw new Error("Process deliverable not found");
  const now = new Date().toISOString();
  const owner = input.owner === undefined ? deliverable.owner : input.owner.trim();
  const uri = input.uri === undefined ? deliverable.uri : input.uri.trim();
  const note = input.note === undefined ? deliverable.note : input.note.trim();
  if (input.status !== "pending" && !owner) throw new Error("Submitted deliverable requires an owner");
  if (input.status !== "pending" && !uri) throw new Error("Submitted deliverable requires a URI");
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        UPDATE process_deliverable_runs
        SET status = ?, owner = ?, uri = ?, note = ?, updated_at = ? WHERE id = ?
      `)
      .run(input.status, owner, uri, note, now, deliverableId);
    database.prepare("UPDATE process_runs SET updated_at = ? WHERE id = ?").run(now, runId);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, run.project_id);
    recordAudit("deliverable", deliverableId, "status_changed", `${deliverable.title}: ${input.status}`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function createProcessEvidence(
  runId: string,
  stageId: string,
  input: CreateProcessEvidenceRequest,
): ProcessRun {
  const { run } = assertCurrentMutableStage(runId, stageId);
  const now = new Date().toISOString();
  const evidenceId = `EVD-${randomUUID().slice(0, 8).toUpperCase()}`;
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        INSERT INTO process_evidence(id, stage_run_id, type, label, url, summary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        evidenceId,
        stageId,
        input.type,
        input.label.trim(),
        input.url.trim(),
        input.summary.trim(),
        now,
      );
    database.prepare("UPDATE process_runs SET updated_at = ? WHERE id = ?").run(now, runId);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, run.project_id);
    recordAudit("evidence", evidenceId, "submitted", `${input.type}: ${input.label.trim()}`, now);
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
  const deliverableCount = database
    .prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved
      FROM process_deliverable_runs WHERE stage_run_id = ? AND required = 1
    `)
    .get(stageId) as unknown as { total: number; approved: number | null };
  if (
    input.decision === "go" &&
    (deliverableCount.approved ?? 0) !== deliverableCount.total
  ) {
    throw new Error("All required deliverables must be approved before GO");
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
      schemaVersion: 5,
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

seedProcessTemplates();
backfillProcessDeliverables();
backfillProjectWorkbenches();
syncDocumentIndex();
