import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class RequestRphDto {
  @IsString()
  subject: string;

  @IsString()
  level: string;

  @IsString()
  topic: string;

  @IsString()
  objectives: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  materials?: string;
}
