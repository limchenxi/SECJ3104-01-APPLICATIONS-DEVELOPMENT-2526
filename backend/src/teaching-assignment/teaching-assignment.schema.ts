import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TeachingAssignment extends Document {
  @Prop({ required: true })
  teacherId: string; // reference to User _id

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  class: string; // e.g. "5 Amanah"

  @Prop({ required: true })
  academicYear: number; // e.g. 2025

  @Prop({ required: true })
  term: string; // e.g. "Semester 1"

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const TeachingAssignmentSchema = SchemaFactory.createForClass(TeachingAssignment);