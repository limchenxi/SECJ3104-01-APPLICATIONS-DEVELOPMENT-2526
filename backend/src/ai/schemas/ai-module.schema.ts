import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AiModule {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true, default: [] })
  usageTypes: string[];

  @Prop({ default: true })
  enabled: boolean;

  @Prop({
    required: true,
    enum: ['OpenAI', 'Gemini', 'Copilot'],
    default: 'Gemini',
  })
  provider: string;

  @Prop({ required: true, default: 'gemini-2.5-flash' })
  model: string;

  // default settings
  @Prop({ default: 0.7 })
  temperature: number;

  @Prop({ default: 2000 })
  maxToken: number;

  @Prop({ default: 30 })
  timeout: number;
}

export const AiModuleSchema = SchemaFactory.createForClass(AiModule);
