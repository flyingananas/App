import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { getAIKey } from './secureStorage';

export interface GenerateOptions {
  model: string;
  provider: 'gemini' | 'claude';
}

export async function generateContent(prompt: string, options: GenerateOptions): Promise<string> {
  const apiKey = await getAIKey(options.provider);
  if (!apiKey) {
    throw new Error(`${options.provider} API key not found in secure storage.`);
  }

  try {
    if (options.provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: options.model,
        contents: prompt
      });
      return response.text || '';
    } else if (options.provider === 'claude') {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: options.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });
      // @ts-ignore - response content has text property in typical use, or we extract the first text block
      const contentBlock = response.content.find((block: any) => block.type === 'text');
      return contentBlock ? contentBlock.text : '';
    }
    throw new Error(`Unknown provider: ${options.provider}`);
  } catch (error: any) {
    throw new Error(`${options.provider} failed: ${error.message}`);
  }
}
