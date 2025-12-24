import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { RequestRphDto } from './request-rph.dto';

class SectionDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class CreateRphDto extends RequestRphDto {
  @IsString()
  title: string;

  @IsString()
  userId: string; // Mandatory for tracking who created it

  @IsNumber()
  createdAt: number; // Use number for sorting

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[];
}
