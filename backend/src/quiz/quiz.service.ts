import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { Quiz } from './schemas/quiz.schema';
import { QuizHistory } from './schemas/quiz-history.schema';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuizHistoryDto } from './dto/create-history.dto';

@Injectable()
export class QuizService {
  private model;

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizHistory.name) private histModel: Model<QuizHistory>,
  ) {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      console.error('❌ Missing GEMINI_API_KEY');
      throw new Error('GEMINI_API_KEY missing');
    }

    const genAI = new GoogleGenerativeAI(key);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  // -----------------------------------------
  // AI Generate Quiz
  // -----------------------------------------
  async generateQuiz(dto: GenerateQuizDto) {
    const difficultyMap = {
      easy: 'Mudah',
      medium: 'Sederhana',
      hard: 'Sukar',
    };

    const prompt = `
Anda adalah pakar pembina soalan UPSR/PMR/SPM.
Jana ${dto.questionCount} soalan berdasarkan:

Topik: ${dto.topic}
Tahap Kesukaran: ${difficultyMap[dto.difficulty]}

FORMAT WAJIB JSON SAHAJA:

{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "answer": "",
      "explanation": ""
    }
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);

      const raw = result.response.text().trim();

      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}') + 1;

      if (start === -1 || end === -1) {
        console.error('❌ Gemini invalid JSON:', raw);
        throw new BadRequestException('AI returned invalid JSON format');
      }

      const data = JSON.parse(raw.slice(start, end));
      const questions = data.questions;

      return {
        questions,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('❌ generateQuiz ERROR:', err);
      throw new InternalServerErrorException('Failed to generate quiz');
    }
  }

  // -----------------------------------------
  // Create Quiz
  // -----------------------------------------
  async createQuiz(dto: CreateQuizDto) {
    return this.quizModel.create(dto);
  }

  // -----------------------------------------
  // Create History
  // -----------------------------------------
  async addHistory(dto: CreateQuizHistoryDto) {
    return this.histModel.create(dto);
  }

  // -----------------------------------------
  // Get all quizzes
  // -----------------------------------------
  async findAll() {
    return this.quizModel.find().sort({ createdAt: -1 });
  }

  // -----------------------------------------
  // Get quiz by ID
  // -----------------------------------------
  async findOne(id: string) {
    const quiz = await this.quizModel.findById(id);
    if (!quiz) throw new NotFoundException('Quiz not found');

    return quiz;
  }

  // -----------------------------------------
  // Get history list
  // -----------------------------------------
  async findHistory() {
    return this.histModel.find().populate('quizId').sort({ createdAt: -1 });
  }
}
