import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAIGeneratedItemDto {
  @IsString()
  @IsNotEmpty()
  module: string; // AI Module name: "Lesson Plan Generator" or "Quiz Generator"

  @IsString()
  @IsNotEmpty()
  provider: string; // "OpenAI"

  @IsString()
  @IsNotEmpty()
  model: string; // "gpt-3.5-turbo" or "gpt-4"

  @IsString()
  @IsNotEmpty()
  title: string; // Generated content title

  @IsString()
  @IsNotEmpty()
  content: string; // Generated content

  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @IsString({ each: true })
  @IsOptional()
  tags?: string[]; // ["math","algebra","form3"]
}
