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
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY,
  });

  private gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  async callAI(aiModule: AiModule, prompt: string): Promise<string> {
    if (!aiModule?.provider)
      throw new BadRequestException('aiModule.provider is required');

    // ───────────────────────────────
    // FREE COPILOT
    // ───────────────────────────────
    if (aiModule.provider === 'Copilot') {
      const res = await fetch('https://copilot.microsoft.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful AI.' },
            { role: 'user', content: prompt },
          ],
        }),
      });

      const result = await res.json();

      // Copilot Response Format:
      // { text: "generated text...", ... }
      if (result?.text) return result.text;

      // Sometimes Copilot returns choices[0].messages
      if (result?.choices?.[0]?.messages?.[0]?.content)
        return result.choices[0].messages[0].content;

      return 'Copilot could not generate a response.';
    }

    // ───────────────────────────────
    // OpenAI
    // ───────────────────────────────
    if (aiModule.provider === 'OpenAI') {
      const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

      const res = await client.chat.completions.create({
        model: aiModule.model ?? 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      return res.choices[0]?.message?.content ?? '';
    }

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
