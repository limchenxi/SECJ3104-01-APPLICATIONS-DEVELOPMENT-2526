import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AiUsage {
  @Prop({ required: true })
  userId: string;

  @Prop({
    required: true,
    enum: ['eRPH', 'Cerapan Comment', 'AI Flashcard', 'AI Topic Quiz'],
  })
  usageType: string; // 例如: 'eRPH'

  @Prop({ required: true })
  provider: string; // 例如: 'Gemini'

  @Prop({ required: true })
  model: string;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);

export const AI_USAGE_MODEL_NAME = 'AiUsage';
