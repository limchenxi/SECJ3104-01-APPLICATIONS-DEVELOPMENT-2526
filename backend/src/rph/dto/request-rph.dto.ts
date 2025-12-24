import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class RequestRphDto {
  @IsString()
  subject: string;

  @IsString()
  level: string;

  @IsString()
  topic: string;

  @IsString() standardKandungan: string;

  @IsString()
  standardPembelajaran: string;

  @IsString()
  objectives: string;

  @IsOptional() @IsString() kriteriaKejayaan?: string;
  @IsOptional() @IsString() emk?: string;
  @IsOptional() @IsString() bbm?: string;
  @IsOptional() @IsString() pbd?: string;

  @IsString() date: string;
  @IsString()
  duration?: string;

  @IsOptional() @IsString() minggu?: string;
}
