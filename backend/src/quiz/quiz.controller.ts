import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuizHistoryDto } from './dto/create-history.dto';
import { GenerateVideoQuizDto } from './dto/generate-video-quiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // -------- AI Generate Quiz --------
  @Post('generate')
  async generate(@Body() dto: GenerateQuizDto) {
    return this.quizService.generateQuiz(dto);
  }

  // -------- AI Generate Flashcards --------
  @Post('ai/flashcards')
  async generateFlashcards(@Body() dto: GenerateQuizDto) {
    // 使用 GenerateQuizDto 作为输入
    return this.quizService.generateFlashcards(dto);
  }

  // -------- AI Generate Video Quiz (New Route) --------
  @Post('ai/video-quiz') // 👈 匹配前端的 /api/ai/video-quiz
  async generateVideoQuiz(@Body() dto: GenerateVideoQuizDto) {
    return this.quizService.generateVideoQuiz(dto);
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

  // -------- Delete specific quiz history record --------
  @Delete('history/:id') // 👈 处理 DELETE /api/quiz/history/:id
  @HttpCode(HttpStatus.NO_CONTENT) // 成功返回 204 No Content
  async deleteHistory(@Param('id') id: string) {
    await this.quizService.deleteHistory(id);
    return; // 204 response body is usually empty
  }

  // -------- Delete specific quiz (if needed) --------
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuiz(@Param('id') id: string) {
    await this.quizService.deleteQuiz(id);
    return;
  }
  // -------- View specific quiz --------
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }
}
