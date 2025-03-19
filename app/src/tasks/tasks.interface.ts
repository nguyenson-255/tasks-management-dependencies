import { PriorityEnum } from "./enum/priority.enum";

export interface TaskI {
    id?: number 

    title?: string

    description?: string;

    dueDate?: Date;

    priority?: PriorityEnum;
}