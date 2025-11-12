import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsString()
  @IsNotEmpty()
  templateId: string; // The _id of the rubric from the 'question' collection

  @IsString()
  @IsNotEmpty()
  period: string; // e.g., "Semester 1, 2025"

  @IsString()
  @IsNotEmpty()
  subject: string; // Mata Pelajaran - e.g., "Matematik"

  @IsString()
  @IsNotEmpty()
  class: string; // Kelas - e.g., "5 Amanah"
}