// src/question/dto/create-question.dto.ts

import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// --- DTO for one question ---
class QuestionItemDto {
  @IsString()
  questionId: string;

  @IsString()
  aspect: string;

  @IsString()
  standard_kualiti: string;

  @IsString()
  tindakan: string;

  @IsArray()
  @IsString({ each: true })
  rubric_levels: string[];
}

// --- Main DTO for creating the whole template ---
export class CreateQuestionDto { // <-- RENAMED
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionItemDto)
  questions: QuestionItemDto[];
}