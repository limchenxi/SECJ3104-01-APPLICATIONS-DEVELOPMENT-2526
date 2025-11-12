// src/question/question.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionController } from './question.controller'; // <-- RENAMED
import { QuestionService } from './question.service'; // <-- RENAMED
import {
  QuestionTemplate,
  QuestionTemplateSchema,
} from './question.schema'; // <-- RENAMED

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuestionTemplate.name, // <-- RENAMED
        schema: QuestionTemplateSchema, // <-- RENAMED
      },
    ]),
  ],
  controllers: [QuestionController], // <-- RENAMED
  providers: [QuestionService], // <-- RENAMED
  exports: [QuestionService], // <-- RENAMED
})
export class QuestionModule {} // <-- RENAMED