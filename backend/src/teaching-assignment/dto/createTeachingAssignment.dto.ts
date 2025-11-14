import { IsString } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsString()
  teacherId: string;

  @IsString()
  classId: string;

  @IsString()
  subjectId: string;

  @IsString()
  year: number;
}
