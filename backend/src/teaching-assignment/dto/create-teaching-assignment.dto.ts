import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsString()
  teacherId: string;

  @IsString()
  subject: string;

  @IsString()
  class: string;

  // Removed academicYear and term

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
