// src/question/question.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- Sub-document for a single question item ---
@Schema({ _id: false })
class QuestionItem {
  @Prop({ required: true })
  id: string; // e.g., "4.1.1a"

  @Prop({ required: true })
  text: string; // e.g., "Menyediakan RPH yang mengandungi objektif..."

  @Prop({ required: true })
  category: string; // e.g., "4.1 GURU SEBAGAI PERANCANG"

  @Prop({ required: true })
  maxScore: number; // e.g., 4 or 5
}
const QuestionItemSchema = SchemaFactory.createForClass(QuestionItem);

// --- The Main Question Template Schema ---
@Schema({ timestamps: true })
export class QuestionTemplate extends Document { // <-- RENAMED
  @Prop({ required: true, unique: true })
  title: string; // e.g., "TAPAK STANDARD 4" or "Set A"

  @Prop({ required: true })
  description: string; // e.g., "PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc)"

  @Prop({ type: [QuestionItemSchema] })
  questions: QuestionItem[];
}

export const QuestionTemplateSchema = // <-- RENAMED
  SchemaFactory.createForClass(QuestionTemplate); // <-- RENAMED