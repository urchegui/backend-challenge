import { Feature, Polygon } from "geojson";
import { Task } from "../models/Task";
import { TaskStatus } from "../workers/taskRunner";
import { Job } from "./Job";
import { area } from "@turf/turf";

export class PolygonAreaJob implements Job {
  async run(task: Task): Promise<void> {
    try {
      const geoJson = JSON.parse(task.geoJson) as Feature<Polygon> | Polygon;
      const polygonArea = area(geoJson);

      task.output = JSON.stringify({ areaSquareMeters: polygonArea });
    } catch (error) {
      task.status = TaskStatus.Failed;
      task.output = JSON.stringify({
        error: `Failed to calculate Polygon's area`,
        message: (error as Error).message,
      });
    }
  }
}
