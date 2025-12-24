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
  standardKandungan: string;
  @Prop({ required: true })
  standardPembelajaran: string;
  @Prop({ required: true })
  objectives: string;
  @Prop()
  kriteriaKejayaan: string;

  @Prop() emk: string; // like: Kelestarian Alam
  @Prop() bbm: string; // material (e.g. Bahan Maujud)
  @Prop() pbd: string;

  @Prop({ required: true })
  date: string;
  @Prop({ required: true })
  duration: string;
  @Prop() minggu: string;

  // AI generated result
  @Prop({ required: true })
  title: string;
  @Prop({
    type: [{ title: String, content: String }],
  })
  sections: Array<{
    title: string;
    content: string;
  }>;

  @Prop() refleksi: string;

  // --- Tracking/History Fields ---
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true, type: Number })
  createdAt: number; // Unix timestamp for easy sorting
}

export const RphSchema = SchemaFactory.createForClass(RPH);
