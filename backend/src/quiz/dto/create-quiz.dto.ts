import { QuizQuestion } from '../schemas/quiz.schema';
import { IsOptional, IsString } from 'class-validator';
import { QuizDifficulty } from './generate-quiz.dto';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  subject: string;

  difficulty: QuizDifficulty;

  questions: QuizQuestion[];

  @IsOptional()
  @IsString()
  createdBy?: string;
}
