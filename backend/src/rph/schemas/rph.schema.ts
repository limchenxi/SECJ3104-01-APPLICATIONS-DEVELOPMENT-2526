import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RphDocument = RPH & Document;

@Schema({ timestamps: true })
export class RPH {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  objectives: string;

  @Prop()
  duration?: string;

  @Prop()
  materials?: string;

  // AI generated result
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: string;

  @Prop()
  generatedAt: string;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  })
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export const RphSchema = SchemaFactory.createForClass(RPH);
