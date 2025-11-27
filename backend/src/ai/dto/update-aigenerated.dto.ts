import { PartialType } from '@nestjs/mapped-types';
import { CreateAIGeneratedItemDto } from './create-aigenerated.dto';

export class UpdateAIGeneratedItemDto extends PartialType(
  CreateAIGeneratedItemDto,
) {}
