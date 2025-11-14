import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true })
  name: string; // e.g. "3A"

  @Prop({ required: true })
  level: number; // e.g. 3

  @Prop({ required: true })
  year: number; // year 2025

  @Prop({ required: false })
  description?: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
