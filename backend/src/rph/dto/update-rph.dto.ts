import { PartialType } from '@nestjs/mapped-types';
import { CreateRphDto } from './create-rph.dto';

export class UpdateRphDto extends PartialType(CreateRphDto) {}
