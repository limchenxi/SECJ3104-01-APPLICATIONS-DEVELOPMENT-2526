// src/cerapan/cerapan.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- Sub-document for question snapshot ---
@Schema({ _id: false })
class QuestionSnapshot {
  @Prop({ required: true })
  questionId: string;
  @Prop({ required: true })
  text: string;
}
const QuestionSnapshotSchema = SchemaFactory.createForClass(QuestionSnapshot);

// --- Sub-document for teacher's answers ---
@Schema({ _id: false })
class SelfEvaluationAnswer {
  @Prop({ required: true })
  questionId: string;
  @Prop({ required: true })
  answer: string;
}
const SelfEvaluationAnswerSchema = SchemaFactory.createForClass(SelfEvaluationAnswer);

// --- Sub-document for admin's marks ---
@Schema({ _id: false })
class AdminMark {
  @Prop({ required: true })
  questionId: string;
  @Prop({ required: true })
  mark: number;
  @Prop({ required: true })
  comment: string;
}
const AdminMarkSchema = SchemaFactory.createForClass(AdminMark);

// --- Sub-document for the 3 observation sections ---
@Schema({ _id: false })
class ObservationSection {
  @Prop({ type: String, enum: ['pending', 'submitted'], default: 'pending' })
  status: string;
  @Prop({ type: Date, default: null })
  submittedAt: Date;
  @Prop({ type: [SelfEvaluationAnswerSchema], default: [] })
  answers: SelfEvaluationAnswer[];
  @Prop({ type: [AdminMarkSchema], default: [] })
  marks: AdminMark[];
  @Prop({ type: String, default: null })
  administratorId?: string;
}
const ObservationSectionSchema = SchemaFactory.createForClass(ObservationSection);

// --- THIS IS YOUR MAIN SCHEMA, NAMED 'Cerapan' ---
@Schema({ timestamps: true })
export class Cerapan extends Document {
  @Prop({ required: true })
  teacherId: string;
  
  @Prop({ required: true })
  period: string; // e.g., "Semester 1, 2025"
  
  @Prop({ required: true })
  subject: string; // Mata Pelajaran - e.g., "Matematik", "Bahasa Melayu"
  
  @Prop({ required: true })
  class: string; // Kelas - e.g., "5 Amanah", "4 Bestari"
  
  @Prop({ type: String, required: true })
  templateId: string; // The _id from your 'QuestionnaireTemplates' collection
  
  @Prop({ required: true })
  status: string; // Overall status: 'pending_self_evaluation', 'pending_observation_1', etc.
  
  @Prop({ type: [QuestionSnapshotSchema], required: true })
  questions_snapshot: QuestionSnapshot[];
  
  // The 3 observation objects
  @Prop({ type: ObservationSectionSchema, required: true })
  self_evaluation: ObservationSection;
  @Prop({ type: ObservationSectionSchema, required: true })
  observation_1: ObservationSection;
  @Prop({ type: ObservationSectionSchema, required: true })
  observation_2: ObservationSection;
}

export const CerapanSchema = SchemaFactory.createForClass(Cerapan);