import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';
import { StatusEnum } from '../enum/status.enum';

export type TaskResponse = Pick<Task, "id" | "title" | "description" | "dueDate" | "priority" | "status" | "dependencies" | "dependents">;

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private taskReponsitory: Repository<Task>
  ) { }

  async create(createTaskDto: CreateTaskDto): Promise<TaskResponse> {
    return await this.taskReponsitory.save(this.taskReponsitory.create(createTaskDto)) as TaskResponse;
  }

  async findAll(getTasksFilterDto: GetTasksFilterDto): Promise<any> {

    let offset: number = 0;
    let limit: number | undefined = 0;
    
    if (getTasksFilterDto.page <= 0) {
      limit = undefined;
    } else {
      offset = (getTasksFilterDto.page - 1) * getTasksFilterDto.limit;
      limit = getTasksFilterDto.limit;
    }
   
    const query = this.taskReponsitory.createQueryBuilder('task');

    if (!!getTasksFilterDto.title) {
      query.andWhere('LOWER(task.title) LIKE LOWER(:title)', { title: `%${getTasksFilterDto.title}%` });
    }

    if (!!getTasksFilterDto.description) {
      query.andWhere('task.description LIKE :description', { description: `${getTasksFilterDto.description}%` });
    }

    if (!!getTasksFilterDto.dueDate) {
      query.andWhere('task.dueDate = :dueDate', { dueDate: getTasksFilterDto.dueDate });
    }

    if (!!getTasksFilterDto.priority) {
      query.andWhere('task.priority = :priority', { priority: getTasksFilterDto.priority });
    }

    const [data, total] = await query.leftJoinAndSelect('task.dependencies', 'dependencies').skip(offset).take(limit).getManyAndCount();

    return {
      data: { data },
      pagination: {
        total: total,
        last_page: !!limit ? Math.ceil(total / limit) : 1,
      }
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskResponse> {

    const task = await this.taskReponsitory.findOne({ where: { id }, relations: ['dependencies'] });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!!updateTaskDto.status && updateTaskDto.status !== StatusEnum.NOT_STARTED) {
      if (await this.canStartTask(task)) {
        task.status = updateTaskDto.status;
      } else {
        throw new BadRequestException('This task cannot be updated until all its dependencies are completed.');
      }
    }

    Object.assign(task, {
      title: updateTaskDto.title ?? task.title,
      description: updateTaskDto.description ?? task.description,
      priority: updateTaskDto.priority ?? task.priority,
      dueDate: updateTaskDto.dueDate ?? task.dueDate
    });

    return await this.taskReponsitory.save(task) as TaskResponse;
  }

  async remove(id: number): Promise<TaskResponse> {
    const task = await this.taskReponsitory.findOne({
      where: { id },
      relations: ['dependencies', 'dependents']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.dependents.forEach(async (element) => {

      // remove dependency with task id 
      this.taskReponsitory.createQueryBuilder().relation(Task, 'dependencies').of(element).remove(task);
      await this.taskReponsitory.save(element);
    });

    return await this.taskReponsitory.remove(task) as TaskResponse;
  }

  private async canStartTask(task: Task): Promise<boolean> {
    if (task) {
      const hasInProgressDependency = task.dependencies.some((element) => element.status !== StatusEnum.COMPLETED);
      if (hasInProgressDependency) {
        return false;
      }
    }
    return true;
  }
}
