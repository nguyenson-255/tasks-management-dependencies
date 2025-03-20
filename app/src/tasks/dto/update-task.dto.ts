import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { StatusEnum } from '../enum/status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {

    @IsOptional()
    @IsEnum(StatusEnum, { message: 'Status must be In Progress, or Completed' })
    status?: StatusEnum;
}
