import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuizHistoryDto {
  @IsString()
  @IsOptional()
  quizId: string;

  @IsString()
  @IsNotEmpty()
  generatedBy: string;

  @IsOptional()
  @IsString()
  snapshot?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  contentType?: string; // e.g., 'quiz-topic', 'flashcard'
}
