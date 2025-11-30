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
import { GenerateVideoQuizDto } from './dto/generate-video-quiz.dto';

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
      console.log('🧪 Raw AI Output:', raw);

      // const start = raw.indexOf('{');
      // const end = raw.lastIndexOf('}') + 1;

      // if (start === -1 || end === -1) {
      //   console.error('❌ Gemini invalid JSON:', raw);
      //   throw new BadRequestException('AI returned invalid JSON format');
      // }
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new BadRequestException('Invalid JSON');
      const data = JSON.parse(match[0]);

      // const data = JSON.parse(raw.slice(start, end));
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

  // AI Generate Flashcards (New Method)
  // -----------------------------------------

  // -----------------------------------------
  async generateFlashcards(dto: GenerateQuizDto) {
    const difficultyMap = {
      easy: 'Mudah',
      medium: 'Sederhana',
      hard: 'Sukar',
    };

    const prompt = `
Anda adalah pakar pembina bahan pembelajaran.
Jana ${dto.questionCount} kad imbas (flashcards) berdasarkan:

Topik: ${dto.topic}
Tahap Kesukaran: ${difficultyMap[dto.difficulty]}

FORMAT WAJIB JSON SAHAJA:

{
 "flashcards": [
  {
    "front": "Istilah atau soalan...",
    "back": "Definisi atau jawapan lengkap..."
  }
 ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const raw = result.response.text().trim();
      console.log('🧪 Raw AI Flashcard Output:', raw);

      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new BadRequestException('Invalid JSON');
      const data = JSON.parse(match[0]);

      return {
        flashcards: data.flashcards || [],
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('❌ generateFlashcards ERROR:', err);
      throw new InternalServerErrorException('Failed to generate flashcards');
    }
  }

  // -----------------------------------------
  // AI Generate Quiz from Video
  // -----------------------------------------
  async generateVideoQuiz(dto: GenerateVideoQuizDto) {
    // 这里的 difficultyMap 暂时不用，但 prompt 结构应和普通 Quiz 保持一致
    const prompt = `
Anda adalah pakar kandungan video dan pembina soalan.
Berdasarkan kandungan video di pautan ini: ${dto.url}

Jana ${dto.questionCount} soalan aneka pilihan berdasarkan maklumat dari video tersebut.

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
      // ⚠️ 注意：Gemini 模型可以直接处理 URL，但你需要确保你的 SDK 版本和配置支持此操作。
      // 我们使用 generateContent 传递 prompt，模型会尝试处理 URL 内容。
      const result = await this.model.generateContent(prompt);

      const raw = result.response.text().trim();
      console.log('🧪 Raw AI Video Quiz Output:', raw);

      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new BadRequestException('Invalid JSON');
      const data = JSON.parse(match[0]);

      const questions = data.questions;

      return {
        questions,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('❌ generateVideoQuiz ERROR:', err);
      throw new InternalServerErrorException('Failed to generate video quiz');
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
  // Delete History Record
  // -----------------------------------------

  // -----------------------------------------
  async deleteHistory(id: string) {
    const result = await this.histModel.findByIdAndDelete(id).exec();

    // 如果 result 为 null，表示找不到该记录，抛出 404
    if (!result) {
      throw new NotFoundException('History record not found');
    }
    return result;
  }
  // -----------------------------------------
  // Delete Quiz (Optional, but good practice)
  // -----------------------------------------

  async deleteQuiz(id: string) {
    const result = await this.quizModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Quiz not found');
    }
    return result;
  }
}
