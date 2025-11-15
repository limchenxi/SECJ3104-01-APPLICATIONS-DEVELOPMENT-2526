import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTeachingAssignmentDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsInt()
  @Min(2000)
  academicYear?: number;

  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
