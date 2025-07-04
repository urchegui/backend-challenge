import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Workflow } from "./Workflow";
import { TaskStatus } from "../workers/taskRunner";

@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn("uuid")
  taskId!: string;

  @Column()
  clientId!: string;

  @Column("text")
  geoJson!: string;

  @Column()
  status!: TaskStatus;

  @Column({ nullable: true, type: "text" })
  progress?: string | null;

  @Column({ nullable: true })
  resultId?: string;

  @Column()
  taskType!: string;

  @Column({ default: 1 })
  stepNumber!: number;

  @Column({ nullable: true, type: "text" })
  output?: string;

  @ManyToOne(() => Workflow, (workflow) => workflow.tasks)
  workflow!: Workflow;

  @ManyToOne(() => Task, { nullable: true })
  dependsOn?: Task;

  @Column({ nullable: true })
  dependsOnTaskId?: string;
}
