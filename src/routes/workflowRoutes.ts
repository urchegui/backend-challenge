import { Router } from "express";
import { Workflow } from "../models/Workflow";
import { Task } from "../models/Task";
import { AppDataSource } from "../data-source";

const router = Router();

router.get("/:id/status", async (req, res) => {
  const { id } = req.params;

  const workflowRepo = AppDataSource.getRepository(Workflow);
  const taskRepo = AppDataSource.getRepository(Task);

  const getWorkflow = await workflowRepo.findOne({
    where: {
      workflowId: id,
    },
  });

  if (!getWorkflow) {
    res.status(404).json({ error: "workflow not found" });
    return;
  }

  const getTasks = await taskRepo.find({
    where: {
      workflow: {
        workflowId: id,
      },
    },
  });
  const completed = getTasks.filter(
    (data) => data.status === "completed"
  ).length;

  res.json({
    workflowId: getWorkflow.workflowId,
    status: getWorkflow.status,
    completed,
    totalNumberOfTasks: getTasks.length,
  });
});

router.get("/:id/results", async (req, res) => {
  try {
    const { id } = req.params;

    const workflowRepo = AppDataSource.getRepository(Workflow);
    const workflow = await workflowRepo.findOne({
      where: {
        workflowId: id,
      },
    });

    if (!workflow) {
      res.status(404).json({ error: "workflow not found" });
      return;
    }

    if (workflow.status !== "completed") {
      res.status(400).json({ error: "Workflow not completed yet" });
    }

    res.json({
      workflowId: workflow.workflowId,
      status: workflow.status,
      finalResult: workflow.finalResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
