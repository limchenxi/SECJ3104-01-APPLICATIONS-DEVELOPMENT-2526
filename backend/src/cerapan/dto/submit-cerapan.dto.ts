import { IsArray, IsString, IsNotEmpty, IsNumber, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Defines the shape of ONE mark
class MarkDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNumber()
  @Min(0) // Set a minimum score
  @Max(5) // Set a maximum score (you can change this)
  mark: number;

  @IsString()
  comment: string; // Admin's comment for this question
}

// This is the main DTO class your controller will use
export class SubmitObservationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkDto)
  marks: MarkDto[];
}