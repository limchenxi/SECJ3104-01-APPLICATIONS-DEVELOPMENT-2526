import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RunAiDto {
  @IsString()
  @IsNotEmpty()
  module: string; // AI Module name: "Lesson Plan Generator" or "Quiz Generator"

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  overrideModel?: string; // Optional model override: "gpt-4" etc.
}
