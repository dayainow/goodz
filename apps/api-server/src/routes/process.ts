import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import type {
  CreateProcessIncidentRequest,
  CreateProcessEvidenceRequest,
  CreateProcessProjectRequest,
  CreateProcessTemplateRequest,
  DecideProcessGateRequest,
  UpdateProcessStageRequest,
  UpdateProcessDeliverableRequest,
  UpdateProcessTaskRequest,
} from "@goodz/process";
import {
  createProcessProject,
  createProcessEvidence,
  createProcessTemplate,
  createIncident,
  decideProcessGate,
  listIncidents,
  loadOperationsOverview,
  loadProcessWorkspace,
  resolveIncident,
  updateProcessStage,
  updateProcessDeliverable,
  updateProcessTask,
} from "../data/operationsStore.js";
import {
  loadProcessDocument,
  loadProcessMetricSnapshots,
  loadProcessStatus,
} from "../data/processStatus.js";

const incidentSeverities = new Set(["low", "medium", "high", "critical"]);
const taskStatuses = new Set(["done", "in_progress", "pending", "blocked"]);
const stageStatuses = new Set(["in_progress", "blocked"]);
const gateDecisions = new Set(["go", "hold", "kill"]);
const deliverableStatuses = new Set(["pending", "submitted", "approved", "changes_requested"]);
const evidenceTypes = new Set(["document", "issue", "pr", "commit", "ci", "release", "link"]);

export const processRouter: ExpressRouter = Router();

processRouter.get("/process/status", (_req, res) => {
  try {
    res.json(loadProcessStatus());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load process status";
    res.status(500).json({ message });
  }
});

processRouter.get("/process/metrics-snapshots", (_req, res) => {
  try {
    res.json(loadProcessMetricSnapshots());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load metric snapshots";
    res.status(500).json({ message });
  }
});

processRouter.get("/process/operations", (_req, res) => {
  res.json(loadOperationsOverview());
});

processRouter.get("/process/workspace", (_req, res) => {
  res.json(loadProcessWorkspace());
});

processRouter.post("/process/templates", (req, res) => {
  const body = req.body as CreateProcessTemplateRequest;
  if (!body?.name?.trim() || !body?.summary?.trim() || !Array.isArray(body.stages)) {
    res.status(400).json({ message: "name, summary, and stages are required" });
    return;
  }
  try {
    res.status(201).json(createProcessTemplate(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create process template";
    res.status(400).json({ message });
  }
});

processRouter.post("/process/projects", (req, res) => {
  const body = req.body as CreateProcessProjectRequest;
  if (
    !body?.name?.trim() ||
    !body?.summary?.trim() ||
    !body?.owner?.trim() ||
    !body?.templateId?.trim()
  ) {
    res.status(400).json({ message: "name, summary, owner, and templateId are required" });
    return;
  }
  try {
    res.status(201).json(createProcessProject(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create process project";
    res.status(400).json({ message });
  }
});

processRouter.patch("/process/runs/:runId/stages/:stageId", (req, res) => {
  const body = req.body as UpdateProcessStageRequest;
  if (!body || !stageStatuses.has(body.status)) {
    res.status(400).json({ message: "valid stage status is required" });
    return;
  }
  try {
    res.json(updateProcessStage(req.params.runId, req.params.stageId, body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update process stage";
    res.status(400).json({ message });
  }
});

processRouter.patch(
  "/process/runs/:runId/stages/:stageId/tasks/:taskId",
  (req, res) => {
    const body = req.body as UpdateProcessTaskRequest;
    if (!body || !taskStatuses.has(body.status)) {
      res.status(400).json({ message: "valid task status is required" });
      return;
    }
    try {
      res.json(
        updateProcessTask(
          req.params.runId,
          req.params.stageId,
          req.params.taskId,
          body,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update process task";
      res.status(400).json({ message });
    }
  },
);

processRouter.patch(
  "/process/runs/:runId/stages/:stageId/deliverables/:deliverableId",
  (req, res) => {
    const body = req.body as UpdateProcessDeliverableRequest;
    if (!body || !deliverableStatuses.has(body.status)) {
      res.status(400).json({ message: "valid deliverable status is required" });
      return;
    }
    try {
      res.json(updateProcessDeliverable(
        req.params.runId,
        req.params.stageId,
        req.params.deliverableId,
        body,
      ));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update process deliverable";
      res.status(400).json({ message });
    }
  },
);

processRouter.post(
  "/process/runs/:runId/stages/:stageId/evidence",
  (req, res) => {
    const body = req.body as CreateProcessEvidenceRequest;
    if (
      !body?.label?.trim() ||
      !body?.url?.trim() ||
      !body?.summary?.trim() ||
      !evidenceTypes.has(body.type)
    ) {
      res.status(400).json({ message: "type, label, url, and summary are required" });
      return;
    }
    try {
      res.status(201).json(createProcessEvidence(req.params.runId, req.params.stageId, body));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit process evidence";
      res.status(400).json({ message });
    }
  },
);

processRouter.post(
  "/process/runs/:runId/stages/:stageId/gate-decisions",
  (req, res) => {
    const body = req.body as DecideProcessGateRequest;
    if (!body || !gateDecisions.has(body.decision) || typeof body.note !== "string") {
      res.status(400).json({ message: "valid decision and note are required" });
      return;
    }
    try {
      res.json(decideProcessGate(req.params.runId, req.params.stageId, body));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to decide process gate";
      res.status(400).json({ message });
    }
  },
);

processRouter.get("/process/incidents", (_req, res) => {
  res.json({ incidents: listIncidents() });
});

processRouter.post("/process/incidents", (req, res) => {
  const body = req.body as CreateProcessIncidentRequest;
  if (
    !body?.title?.trim() ||
    !body?.summary?.trim() ||
    !incidentSeverities.has(body.severity)
  ) {
    res
      .status(400)
      .json({ message: "title, summary, and valid severity are required" });
    return;
  }

  try {
    res.status(201).json(createIncident(body));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create incident";
    res.status(400).json({ message });
  }
});

processRouter.patch("/process/incidents/:id/resolve", (req, res) => {
  const incident = resolveIncident(req.params.id);
  if (!incident) {
    res.status(404).json({ message: "Open incident not found" });
    return;
  }
  res.json(incident);
});

processRouter.get("/process/document", (req, res) => {
  const docPath = typeof req.query.path === "string" ? req.query.path : "";

  if (!docPath) {
    res.status(400).json({ message: "path is required" });
    return;
  }

  try {
    res.json(loadProcessDocument(docPath));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load process document";
    res.status(404).json({ message });
  }
});
