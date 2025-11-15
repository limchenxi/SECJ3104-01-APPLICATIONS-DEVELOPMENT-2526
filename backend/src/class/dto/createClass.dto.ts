import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsNumber()
  level: number;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  description?: string;
}
