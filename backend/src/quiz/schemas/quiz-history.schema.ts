import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuizHistory extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'Quiz',
    required: false,
    index: true,
    default: null,
  })
  quizId: Types.ObjectId | null;

  @Prop({ required: true, enum: ['quiz-topic', 'quiz-video', 'flashcard'] }) // which type of quiz
  contentType: string;

  @Prop({ type: Types.ObjectId, ref: 'Content', required: false })
  contentId: Types.ObjectId;

  @Prop({ required: true })
  generatedBy: string;

  @Prop()
  note: string; // user edit or remark

  @Prop({ type: Object })
  snapshot?: string; // 保存当时的quiz结构，避免后期修改影响历史记录
}

export const QuizHistorySchema = SchemaFactory.createForClass(QuizHistory);
