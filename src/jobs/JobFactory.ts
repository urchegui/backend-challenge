import { Job } from "./Job";
import { DataAnalysisJob } from "./DataAnalysisJob";
import { EmailNotificationJob } from "./EmailNotificationJob";
import { PolygonAreaJob } from "./PolygonAreaJob";
import { ReportGeneratorJob } from "./ReportGeneratorJob";

const jobMap: Record<string, () => Job> = {
  analysis: () => new DataAnalysisJob(),
  notification: () => new EmailNotificationJob(),
  polygonArea: () => new PolygonAreaJob(),
  report: () => new ReportGeneratorJob(),
};

export function getJobForTaskType(taskType: string): Job {
  const jobFactory = jobMap[taskType];
  if (!jobFactory) {
    throw new Error(`No job found for task type: ${taskType}`);
  }
  return jobFactory();
}
