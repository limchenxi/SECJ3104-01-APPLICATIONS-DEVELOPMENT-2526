import { PartialType } from '@nestjs/mapped-types';
import { CreateAIModuleDto } from './create-ai-modul.dto';

export class UpdateAiModuleDto extends PartialType(CreateAIModuleDto) {}
