import { IsString } from 'class-validator';
import { CreateRphDto } from './create-rph.dto';

export class RPHResponseDto extends CreateRphDto {
  @IsString() _id: string;
}
