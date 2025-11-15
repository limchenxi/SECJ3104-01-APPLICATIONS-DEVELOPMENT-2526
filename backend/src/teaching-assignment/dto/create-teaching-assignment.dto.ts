import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsString()
  teacherId: string;

  @IsString()
  subject: string;

  @IsString()
  class: string;

  @IsInt()
  @Min(2000)
  academicYear: number;

  @IsString()
  term: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
