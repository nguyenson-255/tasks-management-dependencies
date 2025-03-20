import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { StatusEnum } from './enum/status.enum';

type TaskResponse = Pick<Task, "id" | "title" | "description" | "dueDate" | "priority" | "status" | "dependencies" | "dependents">;

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

    const offset = (getTasksFilterDto.page - 1) * getTasksFilterDto.limit;
    const limit = getTasksFilterDto.limit;
    const query = await this.taskReponsitory.createQueryBuilder('task');

    console.log(offset, limit);
    

    if (!!getTasksFilterDto.title) {
      query.andWhere('LOWER(task.title) LIKE LOWER(:title)', { title: `%${getTasksFilterDto.title}%` });
    }

    if (!!getTasksFilterDto.description) {
      console.log(`%${getTasksFilterDto.description}`);
      query.andWhere('task.description LIKE :description', { description: `${getTasksFilterDto.description}%` });
    }

    if (!!getTasksFilterDto.dueDate) {
      query.andWhere('task.dueDate = :dueDate', { dueDate: getTasksFilterDto.dueDate });
    }

    if (!!getTasksFilterDto.priority) {
      query.andWhere('task.priority = :priority', { priority: getTasksFilterDto.priority });
    }

    console.log(query.getSql());
    
    const [data, total] = await query.leftJoinAndSelect('task.dependencies', 'dependencies').skip(offset).take(limit).getManyAndCount();

    return {
      data: { data },
      pagination: {
        total_records: total,
        last_page: Math.ceil(total / limit),
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
        throw new BadRequestException('Can not update status this task');
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
      where: {id},
      relations: ['dependencies', 'dependents']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    // 17 <- 18 <- 19
    // 15 <- 18 <- 16
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
