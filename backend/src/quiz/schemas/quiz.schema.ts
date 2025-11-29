import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
//each question in the quiz
export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  answer: string;

  @Prop()
  explanation: string;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  subject: string; // contoh: Science, Maths, BM

  @Prop({ default: 1 })
  difficulty: number; // 1–5

  @Prop({ type: [QuizQuestionSchema], default: [] })
  questions: QuizQuestion[];

  @Prop()
  createdBy: string; // username or ID
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
