import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuizHistoryDto {
  @IsString()
  @IsNotEmpty()
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
}
