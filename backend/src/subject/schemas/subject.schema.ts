import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {
  @Prop({ required: true })
  name: string; // e.g. "Mathematics"

  @Prop({ required: true })
  code: string; // e.g. "MATH01"
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
