import { Router } from "express";
import { AppDataSource } from "../data-source";
import { WorkflowFactory } from "../workflows/WorkflowFactory"; // Create a folder for factories if you prefer
import path from "path";
import { Workflow } from "../models/Workflow";
import { Task } from "../models/Task";

const router = Router();
const workflowFactory = new WorkflowFactory(AppDataSource);

router.post("/", async (req, res) => {
  const { clientId, geoJson } = req.body;
  const workflowFile = path.join(
    __dirname,
    "../workflows/example_workflow.yml"
  );

  try {
    const workflow = await workflowFactory.createWorkflowFromYAML(
      workflowFile,
      clientId,
      JSON.stringify(geoJson)
    );

    res.status(202).json({
      workflowId: workflow.workflowId,
      message: "Workflow created and tasks queued from YAML definition.",
    });
  } catch (error: any) {
    console.error("Error creating workflow:", error);
    res.status(500).json({ message: "Failed to create workflow" });
  }
});

router.get("/workflow/:id/status", async (req, res) => {
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
    satus: getWorkflow.status,
    completed,
    totalNumberOfTasks: getTasks.length,
  });
});

export default router;
