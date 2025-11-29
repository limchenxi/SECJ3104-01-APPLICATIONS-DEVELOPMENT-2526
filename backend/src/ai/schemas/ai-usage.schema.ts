import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AiUsage {
  @Prop() userId: string;
  @Prop() module: string;
  @Prop() provider: string;
  @Prop() model: string;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);
