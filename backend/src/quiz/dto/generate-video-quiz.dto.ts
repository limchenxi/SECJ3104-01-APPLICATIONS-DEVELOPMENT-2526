import { IsNumber, IsString, IsUrl, Min } from 'class-validator';

export class GenerateVideoQuizDto {
  @IsString()
  @IsUrl() // 确保这是一个有效的 URL
  url: string;

  @IsNumber()
  @Min(1) // 至少一个问题
  questionCount: number;
}
