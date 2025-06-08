import { parse } from "path";
import { AppDataSource } from "../data-source";
import { Task } from "../models/Task";
import { TaskStatus } from "../workers/taskRunner";
import { Job } from "./Job";

export class ReportGeneratorJob implements Job {
  async run(task: Task): Promise<void> {
    try {
      const getAllTasks = AppDataSource.getRepository(Task);
      const getFieldTasks = await getAllTasks.find({
        where: {
          workflow: {
            workflowId: task.workflow.workflowId,
          },
        },
        relations: ["workflow"],
      });

      const excludeActualTask = getFieldTasks.filter(
        (t) => t.taskId !== task.taskId
      );

      const taskFinished = getFieldTasks.every(
        (data) =>
          data.status === TaskStatus.Completed ||
          data.status === TaskStatus.Failed
      );

      if (!taskFinished) {
        task.status = TaskStatus.Queued;
      }

      const taskReport = excludeActualTask.map((e) => ({
        taskId: e.taskId,
        type: e.taskType,
        output:
          e.status === TaskStatus.Completed
            ? JSON.stringify(e.output)
            : {
                error: "Something happened with the task",
                output: JSON.stringify(e.output),
              },
      }));

      const report = {
        workflowId: task.workflow.workflowId,
        tasks: taskReport,
        finalReport: "Agregated data and results",
      };

      task.output = JSON.stringify(report);
    } catch (error) {
      console.error("Error in generating the report: " + error);
      (task.status = TaskStatus.Failed),
        (task.output = JSON.stringify({
          error: "Failed to generate report",
          message: (error as Error).message,
        }));
    }
  }
}
