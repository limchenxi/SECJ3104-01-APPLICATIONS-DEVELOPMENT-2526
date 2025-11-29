import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTeachingAssignmentDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  class?: string;

  // Removed academicYear and term

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
