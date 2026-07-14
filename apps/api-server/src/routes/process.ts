import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import type { CreateProcessIncidentRequest } from "@goodz/process";
import {
  createIncident,
  listIncidents,
  loadOperationsOverview,
  resolveIncident,
} from "../data/operationsStore.js";
import {
  loadProcessDocument,
  loadProcessMetricSnapshots,
  loadProcessStatus,
} from "../data/processStatus.js";

const incidentSeverities = new Set(["low", "medium", "high", "critical"]);

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
