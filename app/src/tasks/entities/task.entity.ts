import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PriorityEnum } from "../enum/priority.enum";
import { StatusEnum } from "../enum/status.enum";

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

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NOT_STARTED,
    })
    status: StatusEnum;

    // Tôi cần task nào
    @ManyToMany(() => Task, (task) => task.dependents)
    @JoinTable({
        name: 'task_dependencies',
        joinColumn: {
            name: 'dependentTaskId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'dependencyTaskId',
            referencedColumnName: 'id',
        },
    })
    dependencies: Task[];

    // Task nào cần tôi
    @ManyToMany(() => Task, (task) => task.dependencies, {cascade: true})
    dependents: Task[];
}
