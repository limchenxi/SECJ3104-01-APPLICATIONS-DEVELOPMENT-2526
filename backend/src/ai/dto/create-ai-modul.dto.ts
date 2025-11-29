import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAIModuleDto {
  @IsString()
  name: string;

  @IsString()
  usageType: string;

  @IsString()
  provider: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  maxToken?: number;

  @IsOptional()
  @IsNumber()
  timeout?: number;
}
