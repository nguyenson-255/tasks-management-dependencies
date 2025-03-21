import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TasksService } from "./tasks.service";
import { Task } from "../entities/task.entity";
import { StatusEnum } from "../enum/status.enum";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly tasksService: TasksService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async triggerNotifications() {

    await this.tasksService.findAll({
        page: 0,
        limit: 0
    }).then((response) => {
        const data = Array.from(response.data.data);
        const now = new Date();
        const before1HourNow = new Date(now.getTime() + 60 * 60 * 1000);

        data.forEach((task: Task) => {
            if (task.dueDate && task.status !== StatusEnum.COMPLETED ) {
                if (task.dueDate < now) {

                    this.notificationOverDueTask(task);
                } else if(task.dueDate < before1HourNow) {
    
                    this.notificationUpCommingTask(task);
                }      
            }
        });

    });
  }

  private notificationUpCommingTask(task: Task) {

    this.logger.warn(`Task "${task.title}" (ID: ${task.id}) is due soon at ${task.dueDate}`);
}

  private notificationOverDueTask(task: Task) {

    this.logger.error(`Task "${task.title}" (ID: ${task.id}) is OVERDUE! It was due on ${task.dueDate}.`);
}
}