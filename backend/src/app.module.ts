import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CerapanModule } from './cerapan/cerapan.module';
import { QuizModule } from './quiz/quiz.module';
import { RphModule } from './rph/rph.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { QuestionModule } from './question/question.module';
import { PentadbirModule } from './pentadbir/pentadbir.module';
import { TeachingAssignmentModule } from './teaching-assignment/teaching-assignment.module';
import { AttendanceModule } from './kedatangan/attendance.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchoolModule } from './school/school.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/teacher_system'),
    AiModule,
    AuthModule,
    CerapanModule,
    QuizModule,
    RphModule,
    UsersModule,
    AiModule,
    QuestionModule,
    PentadbirModule,
    TeachingAssignmentModule,
    AttendanceModule,
    ScheduleModule.forRoot(),
    SchoolModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
