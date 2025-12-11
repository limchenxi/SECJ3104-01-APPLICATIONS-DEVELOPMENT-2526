import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizDifficulty } from './generate-quiz.dto';
import { QuizQuestionDto } from './quiz-question.dto';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  subject: string;

  difficulty: QuizDifficulty;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];

  @IsOptional()
  @IsString()
  createdBy?: string;
}
