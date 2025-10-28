import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CerapanModule } from './cerapan/cerapan.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { KedatanganModule } from './kedatangan/kedatangan.module';
import { ProfileModule } from './profile/profile.module';
import { QuizModule } from './quiz/quiz.module';
import { RphModule } from './rph/rph.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_system',
    ),
    AuthModule,
    CerapanModule,
    DashboardModule,
    KedatanganModule,
    ProfileModule,
    QuizModule,
    RphModule,
    UsersModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
