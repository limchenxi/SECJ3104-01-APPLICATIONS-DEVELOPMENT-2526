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
import { AI_USAGE_MODEL_NAME, AiUsage } from 'src/ai/schemas/ai-usage.schema';
@Injectable()
export class RphService {
  private model;

  constructor(
    @InjectModel(RPH.name)
    private rphModel: Model<RPH>,
    @InjectModel(AI_USAGE_MODEL_NAME) private usageModel: Model<AiUsage>,
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

  // async findAll() {
  //   return this.rphModel.find().sort({ createdAt: -1 });
  // }
  async findByUserId(userId: string) {
    return this.rphModel.find({ userId }).sort({ createdAt: -1 }).exec();
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

  async generateRPH(dto: RequestRphDto, userId: string) {
    const prompt = `
    Anda adalah pakar kurikulum KSSR/KSSM di Malaysia. 
    Hasilkan sebuah Rancangan Pengajaran Harian (RPH) yang lengkap dan profesional berdasarkan maklumat berikut:

    MAKLUMAT ASAS:
    - Subjek: ${dto.subject}
    - Tahun/Kelas: ${dto.level}
    - Topik: ${dto.topic}
    - Standard Kandungan: ${dto.standardKandungan}
    - Standard Pembelajaran: ${dto.standardPembelajaran}
    - Objektif: ${dto.objectives}
    - Masa: ${dto.duration}
    - Minggu: ${dto.minggu || 'Tidak dinyatakan'}
    - BBM: ${dto.bbm || 'Tiada maklumat'}

    KEPERLUAN KHAS:
    1. Bina "Kriteria Kejayaan" (Success Criteria) yang bersesuaian dengan objektif.
    2. Tentukan "EMK" (Elemen Merentas Kurikulum) yang relevan (cth: Kelestarian Alam, Nilai Murni, Kreativiti).
    3. Tentukan "PBD" (Pentaksiran Bilik Darjah) yang sesuai (cth: Pemerhatian, Lembaran Kerja).
    4. Sediakan cadangan "Refleksi" kosong (template) dalam bentuk ayat profesional.

    FORMAT OUTPUT (STRICT JSON):
    Sila balas dalam format JSON SAHAJA tanpa sebarang teks penjelasan lain:

    {
      "title": "Tajuk RPH yang sesuai",
      "kriteriaKejayaan": "Senarai kriteria kejayaan (bullet points)",
      "emk": "Elemen EMK yang terlibat",
      "pbd": "Kaedah pentaksiran yang digunakan",
      "sections": [
        { "title": "Set Induksi (5 minit)", "content": "..." },
        { "title": "Langkah 1 (15 minit)", "content": "..." },
        { "title": "Langkah 2 (20 minit)", "content": "..." },
        { "title": "Penutup (5 minit)", "content": "..." }
      ],
      "refleksi": "___ orang murid dapat menguasai objektif pembelajaran dan diberi latihan pengayaan."
    }
  `;

    let raw: string | undefined;
    try {
      const result = await this.model.generateContent(prompt);

      raw = result.response.text().trim();
      if (!raw) throw new Error('Empty response from AI');

      console.log('DEBUG: AI Raw Response:', raw);

      // Clean cleanup of potential markdown formatting
      const jsonMatch = raw.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const jsonString = jsonMatch[0];


      const aiResult: any = JSON.parse(jsonString); // Use any temporarily to handle type mismatch

      // Normalize AI output (Array -> String)
      if (Array.isArray(aiResult.kriteriaKejayaan)) {
        aiResult.kriteriaKejayaan = aiResult.kriteriaKejayaan.join('\n');
      }
      if (Array.isArray(aiResult.emk)) {
        aiResult.emk = aiResult.emk.join(', ');
      }
      if (Array.isArray(aiResult.pbd)) {
        aiResult.pbd = aiResult.pbd.join(', ');
      }

      // 🌟 关键：记录 AI Usage
      await this.usageModel.create({
        userId: userId,
        usageType: 'eRPH', // 明确指出 Usage Type
        provider: 'Gemini', // 明确指出 Provider
        model: 'gemini-2.5-flash', // 明确指出 Model
      });
      const fullDocument: Omit<CreateRphDto, '_id'> = {
        ...dto, // User input fields
        ...aiResult, // AI generated fields (title, date, sections)
        userId: userId,
        createdAt: Date.now(),
      };

      // 4. Save the complete document
      const savedDoc = await this.rphModel.create(fullDocument);
      return savedDoc;
      // return JSON.parse(jsonString);
    } catch (err) {
      console.error('❌ generateRPH ERROR:', err);
      try {
        require('fs').appendFileSync('debug_rph_error.log', `[${new Date().toISOString()}] Error: ${err}\nRaw: ${raw}\n\n`);
      } catch (e) { /* ignore log error */ }

      if (typeof raw !== 'undefined') console.log('DEBUG: Raw response:', raw);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(`Failed to generate RPH: ${err instanceof Error ? err.message : String(err)} Raw: ${typeof raw !== 'undefined' ? raw.substring(0, 100) : 'null'}`);
    }
  }
}
