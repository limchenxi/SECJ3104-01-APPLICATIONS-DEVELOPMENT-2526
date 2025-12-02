import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AiGeneratedItem {
  @Prop({ required: true }) module: string;
  @Prop({ required: true }) provider: string;
  @Prop({ required: true }) model: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) content: string;
  @Prop({ type: [String], default: [] }) tags: string[];
}

export const AiGeneratedItemSchema =
  SchemaFactory.createForClass(AiGeneratedItem);
