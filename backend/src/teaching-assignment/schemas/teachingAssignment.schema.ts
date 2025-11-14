import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeachingAssignmentDocument = TeachingAssignment & Document;

@Schema({ timestamps: true })
export class TeachingAssignment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: string;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: string;
  @Prop({ required: true })
  year: number;
}

export const TeachingAssignmentSchema =
  SchemaFactory.createForClass(TeachingAssignment);
