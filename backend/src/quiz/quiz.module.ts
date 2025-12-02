import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { QuizHistory, QuizHistorySchema } from './schemas/quiz-history.schema';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizHistory.name, schema: QuizHistorySchema },
    ]),
    AiModule,
  ],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
