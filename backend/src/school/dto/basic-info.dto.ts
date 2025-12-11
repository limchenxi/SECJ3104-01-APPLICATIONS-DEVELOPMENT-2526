import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class BasicInfoDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['zh-CN', 'en-US', 'ms-MY'])
  language: string;

  @IsString()
  @IsNotEmpty()
  currentAcademicYear: string;
}
