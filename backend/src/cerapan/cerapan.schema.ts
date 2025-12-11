import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Score Description Schema
@Schema({ _id: false })
class ScoreDescription {
  @Prop({ required: true })
  score: number; // 0-4

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  description: string;
}
const ScoreDescriptionSchema = SchemaFactory.createForClass(ScoreDescription);

// --- Sub-document for question snapshot ---
@Schema({ _id: false })
export class QuestionSnapshot {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  maxScore: number;

  @Prop({ required: false })
  categoryCode?: string;

  @Prop({ required: false })
  subCategoryCode?: string;

  @Prop({ type: [ScoreDescriptionSchema], default: [] })
  scoreDescriptions: ScoreDescription[]; // Array of score 0-4 descriptions
}
const QuestionSnapshotSchema = SchemaFactory.createForClass(QuestionSnapshot);

@Schema({ _id: false })
class SelfEvaluationAnswer {
  @Prop({ required: true })
  questionId: string;
  @Prop({ required: true })
  answer: string;
}
const SelfEvaluationAnswerSchema =
  SchemaFactory.createForClass(SelfEvaluationAnswer);

@Schema({ _id: false })
export class AdminMark {
  @Prop({ required: true })
  questionId: string;
  @Prop({ required: true })
  mark: number;
  @Prop({ required: false })
  comment?: string;
}
const AdminMarkSchema = SchemaFactory.createForClass(AdminMark);

// --- Sub-document for the 3 observation sections ---
@Schema({ _id: false })
export class ObservationSection {
  @Prop({ type: String, enum: ['pending', 'submitted'], default: 'pending' })
  status: string;
  @Prop({ type: Date, default: null })
  submittedAt?: Date | null;
  @Prop({ type: [SelfEvaluationAnswerSchema], default: [] })
  answers: SelfEvaluationAnswer[];
  @Prop({ type: [AdminMarkSchema], default: [] })
  marks: AdminMark[];
  @Prop({ type: String, default: null })
  administratorId?: string;
}
const ObservationSectionSchema =
  SchemaFactory.createForClass(ObservationSection);

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
  templateId: string;

  @Prop({ required: true })
  status: string; // Overall status: 'pending_self_evaluation', 'pending_observation_1', etc.

  @Prop({ type: [QuestionSnapshotSchema], required: true })
  questions_snapshot: QuestionSnapshot[];

  // Schedule information
  @Prop({ type: String, default: null })
  scheduledDate?: string;

  @Prop({ type: String, default: null })
  scheduledTime?: string;

  @Prop({ type: String, default: null })
  observerName?: string;

  @Prop({ type: String, default: null })
  templateRubric?: string;

  @Prop({ type: String, default: null })
  notes?: string;

  @Prop({ type: String, default: null })
  observationType?: string; // 'Cerapan 1' or 'Cerapan 2'

  // The 3 observation objects
  @Prop({ type: ObservationSectionSchema, required: true })
  self_evaluation: ObservationSection;
  @Prop({ type: ObservationSectionSchema, required: true })
  observation_1: ObservationSection;
  @Prop({ type: ObservationSectionSchema, required: true })
  observation_2: ObservationSection;

  @Prop({ type: String, default: null })
  aiComment?: string;
}

export const CerapanSchema = SchemaFactory.createForClass(Cerapan);
CerapanSchema.index({ teacherId: 1, subject: 1, class: 1 }, { unique: true });
