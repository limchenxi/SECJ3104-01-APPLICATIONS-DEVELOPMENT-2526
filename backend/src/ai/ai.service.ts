import {
  Injectable,
  BadRequestException,
  NotImplementedException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

type AiModule = {
  provider: string;
  model?: string;
};

@Injectable()
export class AiService {
  // private openai = new OpenAI({
  //   apiKey: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY,
  // });

  private gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  async callAI(aiModule: AiModule, prompt: string): Promise<string> {
    if (!aiModule?.provider)
      throw new BadRequestException('aiModule.provider is required');

    // ───────────────────────────────
    // Google Gemini
    // ───────────────────────────────
    if (aiModule.provider === 'Gemini') {
      const model = aiModule.model || 'gemini-1.5-flash';

      const gen = this.gemini.getGenerativeModel({ model });
      const result = await gen.generateContent(prompt);

      return result.response.text() ?? '';
    }

    throw new NotImplementedException(`Unknown provider: ${aiModule.provider}`);
  }
}
