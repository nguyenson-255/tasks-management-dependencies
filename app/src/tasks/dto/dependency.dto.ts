import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DependencyDto {

    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    dependentTaskId: number;

    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    dependencyTaskId: number;
}