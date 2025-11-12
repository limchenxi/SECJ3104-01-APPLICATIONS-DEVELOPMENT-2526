import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CerapanModule } from './cerapan/cerapan.module';
<<<<<<< HEAD
//import { KedatanganModule } from './kedatangan/kedatangan.module';
import { ProfileModule } from './profile/profile.module';
=======
// import { KedatanganModule } from './kedatangan/kedatangan.module';
>>>>>>> main
import { QuizModule } from './quiz/quiz.module';
import { RphModule } from './rph/rph.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/teacher_system'),
    AuthModule,
    CerapanModule,
<<<<<<< HEAD
    //KedatanganModule,
    ProfileModule,
=======
    // KedatanganModule,
>>>>>>> main
    QuizModule,
    RphModule,
    UsersModule,
    AiModule,
    QuestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
