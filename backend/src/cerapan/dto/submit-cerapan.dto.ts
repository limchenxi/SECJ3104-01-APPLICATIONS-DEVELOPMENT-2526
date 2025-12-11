import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MarkDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNumber()
  @Min(0)
  @Max(4)
  mark: number;

  @IsString()
  @IsOptional()
  comment?: string; // optional comment
}

export class SubmitObservationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkDto)
  marks: MarkDto[];
}
