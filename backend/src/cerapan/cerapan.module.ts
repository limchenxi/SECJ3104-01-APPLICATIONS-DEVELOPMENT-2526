// src/cerapan/cerapan.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CerapanController } from './cerapan.controller';
import { CerapanService } from './cerapan.service';
import { Cerapan, CerapanSchema } from './cerapan.schema';
import { QuestionModule } from '../question/question.module'; // <-- 1. IMPORT QuestionModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cerapan.name, schema: CerapanSchema },
    ]),
    QuestionModule, // <-- 2. ADD IT HERE
  ],
  controllers: [CerapanController],
  providers: [CerapanService],
})
export class CerapanModule {}