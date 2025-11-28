import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested } from 'class-validator';

class SectionDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class RPHResponseDto {
  @IsString()
  title: string;

  @IsString()
  date: string;

  @IsString()
  duration: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[];
}
