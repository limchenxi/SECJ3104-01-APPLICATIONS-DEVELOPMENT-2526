// src/cerapan/dto/submit-cerapankendiri.dto.ts

import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Defines the shape of ONE answer in the array
class AnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}

// This is the main DTO class your controller will use
export class SubmitCerapankendiriDto {
  @IsArray()
  @ValidateNested({ each: true }) // Validates each object in the array
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
