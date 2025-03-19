import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PriorityEnum } from "../enum/priority.enum";
import { Transform } from "class-transformer";

export class CreateTaskDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Transform(({ value }) => new Date(value))
    @IsNotEmpty()
    @IsDate()
    dueDate: Date;

    @IsOptional()
    @IsEnum(PriorityEnum, { message: 'Priority must be low, medium, or high' })
    priority?: PriorityEnum;
}
