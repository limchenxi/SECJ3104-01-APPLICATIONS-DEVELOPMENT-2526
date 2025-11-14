import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
