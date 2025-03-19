import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PriorityEnum } from '../enum/priority.enum';
import { Transform } from 'class-transformer';

export class GetTasksFilterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dueDate?: Date;
  
  @IsOptional()
  @IsEnum(PriorityEnum, { message: 'Priority must be low, medium, or high' })
  priority?: PriorityEnum;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number = 1;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit: number = 10;
}
