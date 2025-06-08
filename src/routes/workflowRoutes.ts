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
    return res.status(404);
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

  return res.json({
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
      return res.status(404);
    }

    if (workflow.status !== "completed") {
      return res.status(400);
    }

    return res.json({
      workflowId: workflow.workflowId,
      status: workflow.status,
      finalResult: workflow.finalResult,
    });
  } catch (error: any) {
    res.status(500);
  }
});

export default router;
