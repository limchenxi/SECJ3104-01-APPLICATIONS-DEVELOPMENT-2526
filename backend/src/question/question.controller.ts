// src/question/question.controller.ts

import { Controller, Post, Get, Param, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service'; // <-- RENAMED
import { CreateQuestionDto } from './dto/create-question.dto'; // <-- RENAMED
// import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('question') // Base route: /question  <-- RENAMED
// @UseGuards(AdminAuthGuard)
export class QuestionController { // <-- RENAMED
  constructor(private readonly questionService: QuestionService) {} // <-- RENAMED

  // POST /question
  @Post()
  create(@Body() dto: CreateQuestionDto) { // <-- RENAMED
    return this.questionService.create(dto); // <-- RENAMED
  }

  // GET /question
  @Get()
  findAll() {
    return this.questionService.findAll(); // <-- RENAMED
  }

  // GET /question/60f...
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id); // <-- RENAMED
  }

  // PUT /question/60f...
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateQuestionDto) { // <-- RENAMED
    return this.questionService.update(id, dto); // <-- RENAMED
  }
  
  // DELETE /question/60f...
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.questionService.delete(id); // <-- RENAMED
  }
}