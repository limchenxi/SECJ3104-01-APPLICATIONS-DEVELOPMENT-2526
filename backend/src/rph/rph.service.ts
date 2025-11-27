import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RPH } from './schemas/rph.schema';
import { CreateRphDto } from './dto/create-rph.dto';
import { UpdateRphDto } from './dto/update-rph.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RequestRphDto } from './dto/request-rph.dto';

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
  "date": "",
  "duration": "",
  "sections": [
    { "title": "", "content": "" }
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
        throw new InternalServerErrorException('AI returned invalid JSON');
      }

      const jsonString = raw.slice(start, end);

      return JSON.parse(jsonString);
    } catch (err) {
      console.error('❌ generateRPH ERROR:', err);
      throw new InternalServerErrorException('Failed to generate RPH');
    }
  }
}
