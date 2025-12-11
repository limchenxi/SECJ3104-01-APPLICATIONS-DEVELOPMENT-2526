import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AiUsage {
  @Prop() userId: string;
  @Prop() usageType: string;
  @Prop() provider: string;
  @Prop() model: string;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);

export const AI_USAGE_MODEL_NAME = 'AiUsage';
