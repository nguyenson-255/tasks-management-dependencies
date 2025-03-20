import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskDependencyService } from './services/task-dependency.service';
import { DependencyDto } from './dto/dependency.dto';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly tasksDependencyService: TaskDependencyService,
  ) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll(@Query() getTasksFilterDto: GetTasksFilterDto) {
    return this.tasksService.findAll(getTasksFilterDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

  @Get('addTaskDependency')
  addTaskDependency(@Query() dependencyDto: DependencyDto) {
    return this.tasksDependencyService.addTaskDependency(dependencyDto);
  }

  @Get('removeTaskDependency')
  removeTaskDependency(@Query() dependencyDto: DependencyDto) {
    return this.tasksDependencyService.removeTaskDependency(dependencyDto);
  }

  @Get('getTaskDependencies/:id')
  getTaskDependencies(@Param('id') id: string) {
    return this.tasksDependencyService.getTaskDependencies(+id);
  }
}
