import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RPH } from './schemas/rph.schema';
import { CreateRphDto } from './dto/create-rph.dto';
import { UpdateRphDto } from './dto/update-rph.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RequestRphDto } from './dto/request-rph.dto';
import { RPHResponseDto } from './dto/response-rph.dto';
@Injectable()
export class RphService {
  private model;

  constructor(
    @InjectModel(RPH.name)
    private rphModel: Model<RPH>,
  ) {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      console.error('❌ GEMINI_API_KEY missing in environment variables');
      throw new Error('GEMINI_API_KEY is missing');
    }

    const genAI = new GoogleGenerativeAI(key);

    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  async create(data: CreateRphDto) {
    return this.rphModel.create(data);
  }

  async findAll() {
    return this.rphModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const doc = await this.rphModel.findById(id);
    if (!doc) throw new NotFoundException('RPH not found');
    return doc;
  }

  async update(id: string, dto: UpdateRphDto) {
    const doc = await this.rphModel.findByIdAndUpdate(id, dto, { new: true });
    if (!doc) throw new NotFoundException('RPH not found');
    return doc;
  }

  async remove(id: string) {
    return this.rphModel.findByIdAndDelete(id);
  }

  async generateRPH(dto: RequestRphDto) {
    const prompt = `
    Anda adalah guru pakar pendidikan Malaysia.
    Jana sebuah Rancangan Pengajaran Harian (RPH) berdasarkan maklumat berikut:

    Subjek: ${dto.subject}
    Tahun: ${dto.level}
    Topik: ${dto.topic}
    Objektif Pembelajaran:
    ${dto.objectives}

    Tempoh Masa: ${dto.duration}
    BBM: ${dto.materials}

    Hasilkan STRICT JSON tanpa ayat tambahan:

    {
      "title": "",
      "date": "Tarikh: ${new Date().toLocaleDateString('ms-MY')}",
      "duration": "${dto.duration || '60 Minit'}",
      "sections": [
        { "title": "Set Induksi (5 minit)", "content": "" }
      ]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);

      const raw = result.response.text().trim();

      // extract JSON safely
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}') + 1;

      if (start === -1 || end === -1) {
        console.error('❌ Gemini returned non-JSON:', raw);
        throw new BadRequestException('AI returned invalid JSON format');
      }

      const jsonString = raw.slice(start, end);
      const aiResult: RPHResponseDto = JSON.parse(jsonString);
      const simulatedUserId = 'SimulatedTeacherId123';

      const fullDocument: Omit<CreateRphDto, '_id'> = {
        ...dto, // User input fields
        ...aiResult, // AI generated fields (title, date, sections)
        userId: simulatedUserId,
        createdAt: Date.now(),
      };

      // 4. Save the complete document
      const savedDoc = await this.rphModel.create(fullDocument);
      return savedDoc;
      // return JSON.parse(jsonString);
    } catch (err) {
      console.error('❌ generateRPH ERROR:', err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to generate RPH');
    }
  }
}
