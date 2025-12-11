import { IsString, IsNotEmpty } from 'class-validator';
export class SelfStartEvaluationDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  class: string;
}
