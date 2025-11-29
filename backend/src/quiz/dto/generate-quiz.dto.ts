import { IsNumber, IsString } from 'class-validator';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export class GenerateQuizDto {
  @IsString()
  topic: string;

  difficulty: QuizDifficulty; // "easy" | "medium" | "hard"

  @IsNumber()
  questionCount: number;
}
