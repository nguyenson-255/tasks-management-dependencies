import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PriorityEnum } from "../enum/priority.enum";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({
        default: ''
    })
    description: string;

    @Column()
    dueDate: Date;

    @Column({
        type: 'enum',
        enum: PriorityEnum,
        default: PriorityEnum.MEDIUM,
    })
    priority: PriorityEnum;
}
