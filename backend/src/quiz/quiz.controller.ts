import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuizHistoryDto } from './dto/create-history.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // -------- AI Generate Quiz --------
  @Post('generate')
  async generate(@Body() dto: GenerateQuizDto) {
    return this.quizService.generateQuiz(dto);
  }

  // -------- Save generated quiz --------
  @Post()
  async createQuiz(@Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(dto);
  }

  // -------- Save history --------
  @Post('history')
  async createHistory(@Body() dto: CreateQuizHistoryDto) {
    return this.quizService.addHistory(dto);
  }

  // -------- List all quizzes --------
  @Get()
  async findAll() {
    return this.quizService.findAll();
  }

  // -------- List history --------
  @Get('history')
  async findHistory() {
    return this.quizService.findHistory();
  }

  // -------- View specific quiz --------
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }
}
