import * as fs from "fs";
import * as yaml from "js-yaml";
import { DataSource } from "typeorm";
import { Workflow } from "../models/Workflow";
import { Task } from "../models/Task";
import { TaskStatus } from "../workers/taskRunner";

export enum WorkflowStatus {
  Initial = "initial",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed",
}

interface WorkflowStep {
  taskType: string;
  stepNumber: number;
  dependsOn: number;
}

interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
}

export class WorkflowFactory {
  constructor(private dataSource: DataSource) {}

  /**
   * Creates a workflow by reading a YAML file and constructing the Workflow and Task entities.
   * @param filePath - Path to the YAML file.
   * @param clientId - Client identifier for the workflow.
   * @param geoJson - The geoJson data string for tasks (customize as needed).
   * @returns A promise that resolves to the created Workflow.
   */
  async createWorkflowFromYAML(
    filePath: string,
    clientId: string,
    geoJson: string
  ): Promise<Workflow> {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const workflowDef = yaml.load(fileContent) as WorkflowDefinition;
    const workflowRepository = this.dataSource.getRepository(Workflow);
    const taskRepository = this.dataSource.getRepository(Task);
    const workflow = new Workflow();

    workflow.clientId = clientId;
    workflow.status = WorkflowStatus.Initial;

    const savedWorkflow = await workflowRepository.save(workflow);

    const taskMap = new Map<number, Task>();

    for (const step of workflowDef.steps) {
      const task = new Task();
      task.clientId = clientId;
      task.geoJson = geoJson;
      task.status = TaskStatus.Queued;
      task.taskType = step.taskType;
      task.stepNumber = step.stepNumber;
      task.workflow = savedWorkflow;
      taskMap.set(step.stepNumber, task);
    }
    await taskRepository.save([...taskMap.values()]);

    for (const step of workflowDef.steps) {
      const task = taskMap.get(step.stepNumber)!;
      if (step.dependsOn) {
        const dependsOnTask = taskMap.get(step.dependsOn);
        if (dependsOnTask) {
          task.dependsOn = dependsOnTask;
        }
      }
    }

    await taskRepository.save([...taskMap.values()]);

    return savedWorkflow;
  }
}
