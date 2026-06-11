import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { getAIKey } from './secureStorage';

export interface GenerateOptions {
  model: string;
  provider: 'gemini' | 'claude';
  systemPrompt?: string;
}

export type Message = { role: 'user' | 'assistant', content: string };

export async function generateContent(promptOrMessages: string | Message[], options: GenerateOptions): Promise<string> {
  const apiKey = await getAIKey(options.provider);
  if (!apiKey) {
    throw new Error(`${options.provider} API key not found in secure storage.`);
  }

  const isMultiTurn = Array.isArray(promptOrMessages);

  try {
    if (options.provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey });
      const config: any = {};
      if (options.systemPrompt) {
        config.systemInstruction = options.systemPrompt;
      }

      let contents;
      if (isMultiTurn) {
        contents = (promptOrMessages as Message[]).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
      } else {
        contents = promptOrMessages as string;
      }

      const response = await ai.models.generateContent({
        model: options.model,
        contents,
        config
      });
      return response.text || '';
    } else if (options.provider === 'claude') {
      const anthropic = new Anthropic({ apiKey });

      let messages: any[];
      if (isMultiTurn) {
        messages = promptOrMessages as Message[];
      } else {
        messages = [{ role: 'user', content: promptOrMessages as string }];
      }

      const requestObj: any = {
        model: options.model,
        max_tokens: 1024,
        messages
      };
      if (options.systemPrompt) {
        requestObj.system = options.systemPrompt;
      }

      const response = await anthropic.messages.create(requestObj);
      // @ts-ignore
      const contentBlock = response.content.find((block: any) => block.type === 'text');
      return contentBlock ? contentBlock.text : '';
    }
    throw new Error(`Unknown provider: ${options.provider}`);
  } catch (error: any) {
    throw new Error(`${options.provider} failed: ${error.message}`);
  }
}
