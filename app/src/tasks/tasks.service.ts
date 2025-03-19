import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskI } from './tasks.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private taskReponsitory: Repository<Task>
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskI> {
    return await this.taskReponsitory.save(this.taskReponsitory.create(createTaskDto));
  }

  async findAll(getTasksFilterDto: GetTasksFilterDto): Promise<any> {
    

    const offset = (getTasksFilterDto.page - 1) * getTasksFilterDto.limit;
    const limit = getTasksFilterDto.limit;
    const query = await this.taskReponsitory.createQueryBuilder('task');

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

    const [data, total] = await query.skip(offset).limit(limit).getManyAndCount();

    return {
      data: {data},
      pagination: {
        total_records: total,
        total_pages: Math.ceil(total / limit),
      } 
    }
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
