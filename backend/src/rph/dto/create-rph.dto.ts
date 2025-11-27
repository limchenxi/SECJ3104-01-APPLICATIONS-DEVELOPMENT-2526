import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

class SectionDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class CreateRphDto {
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

  @IsString()
  title: string;

  @IsString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[];
}
