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
import { AI_USAGE_MODEL_NAME, AiUsage } from 'src/ai/schemas/ai-usage.schema';

@Injectable()
export class QuizService {
  private model;

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizHistory.name) private histModel: Model<QuizHistory>,
    @InjectModel(AI_USAGE_MODEL_NAME) private usageModel: Model<AiUsage>,
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
  async generateQuiz(dto: GenerateQuizDto, userId: string) {
    const difficultyMap = {
      easy: 'Mudah',
      medium: 'Sederhana',
      hard: 'Sukar',
    };
    const yearInfo = dto.year ? ` untuk pelajar Tahun ${dto.year}` : '';

    const prompt = `
Anda adalah pakar pembina soalan sekolah rendah.
Jana ${dto.questionCount} soalan berdasarkan:

Topik: ${dto.topic}
Tahap Kesukaran: ${difficultyMap[dto.difficulty]} ${yearInfo}

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
      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
      });

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

      // 🌟 关键：记录 AI Usage
      await this.usageModel.create({
        userId: userId,
        usageType: 'AI Topic Quiz',
        provider: 'Gemini',
        model: 'gemini-2.5-flash',
      });

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
  // AI Generate Flashcards
  // -----------------------------------------
  async generateFlashcards(dto: GenerateQuizDto, userId: string) {
    const difficultyMap = {
      easy: 'Mudah',
      medium: 'Sederhana',
      hard: 'Sukar',
    };

    const yearInfo = dto.year ? ` untuk pelajar Tahun ${dto.year}` : '';

    const prompt = `
Anda adalah pakar pembina bahan pembelajaran.
Jana ${dto.questionCount} kad imbas (flashcards) berdasarkan:

Topik: ${dto.topic}
Tahap Kesukaran: ${difficultyMap[dto.difficulty]} ${yearInfo}

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
      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
      });
      const raw = result.response.text().trim();
      console.log('🧪 Raw AI Flashcard Output:', raw);

      const match = raw.match(/\{[\s\S]*\}/);
      if (!match)
        throw new BadRequestException(
          'AI did not return a valid JSON structure.',
        );

      let data: any;
      try {
        data = JSON.parse(match[0]);
      } catch (e) {
        console.error('❌ JSON Parse Error:', e);
        throw new BadRequestException('Invalid JSON structure returned by AI.');
      }

      if (!data.flashcards) {
        throw new BadRequestException(
          'JSON is missing the required "flashcards" field.',
        );
      }

      await this.usageModel.create({
        userId: userId, // 使用真实的 userId
        usageType: 'AI Flashcard', // 假设 Flashcard 是一个独立的 Usage Type
        provider: 'Gemini',
        model: 'gemini-2.5-flash',
      });

      // const data = JSON.parse(match[0]);

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
  //   async generateVideoQuiz(dto: GenerateVideoQuizDto) {
  //     // 这里的 difficultyMap 暂时不用，但 prompt 结构应和普通 Quiz 保持一致
  //     const prompt = `
  // Anda adalah pakar kandungan video dan pembina soalan.
  // Berdasarkan kandungan video di pautan ini: ${dto.url}

  // Jana ${dto.questionCount} soalan aneka pilihan berdasarkan maklumat dari video tersebut.

  // FORMAT WAJIB JSON SAHAJA:

  // {
  //  "questions": [
  //   {
  //     "question": "",
  //     "options": ["", "", "", ""],
  //     "answer": "",
  //     "explanation": ""
  //   }
  //  ]
  // }
  // `;
  //     try {
  //       const result = await this.model.generateContent({
  //         contents: [{ parts: [{ text: prompt }] }],
  //         tools: [{ google_search: {} }], // 启用搜索工具
  //         systemInstruction:
  //           'You are a specialist in analyzing external content to create quizzes. Use the provided URL and search results to ensure accuracy.',
  //       });

  //       const raw = result.response.text().trim();
  //       console.log('🧪 Raw AI Video Quiz Output:', raw);

  //       const match = raw.match(/\{[\s\S]*\}/);
  //       if (!match)
  //         throw new BadRequestException(
  //           'AI did not return a valid JSON structure.',
  //         );
  //       const data = JSON.parse(match[0]);
  //       const questions = data.questions;
  //       // let data: any;
  //       // try {
  //       //   data = JSON.parse(match[0]);
  //       // } catch (e) {
  //       //   console.error('❌ JSON Parse Error:', e);
  //       //   throw new BadRequestException('Invalid JSON structure returned by AI.');
  //       // }

  //       // if (!data.questions) {
  //       //   throw new BadRequestException(
  //       //     'JSON is missing the required "questions" field.',
  //       //   );
  //       // }
  //       return {
  //         questions,
  //         generatedAt: new Date().toISOString(),
  //       };
  //     } catch (err) {
  //       console.error('❌ generateVideoQuiz ERROR:', err);
  //       throw new InternalServerErrorException('Failed to generate video quiz');
  //     }
  //   }
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
