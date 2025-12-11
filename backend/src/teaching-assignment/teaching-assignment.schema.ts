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

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const TeachingAssignmentSchema = SchemaFactory.createForClass(TeachingAssignment);
TeachingAssignmentSchema.index({ teacherId: 1, subject: 1, class: 1 }, { unique: true });