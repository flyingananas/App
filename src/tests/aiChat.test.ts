import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as aiAdapter from '../main/aiAdapter';
import * as api from '../main/api';
import { initDb, closeDb } from '../main/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

vi.mock('../main/secureStorage', () => ({
  getAIKey: vi.fn().mockResolvedValue('fake-key')
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: vi.fn().mockImplementation(async (args) => {
        const prompt = typeof args.contents === 'string' ? args.contents : JSON.stringify(args.contents);
        const sysPrompt = args.config?.systemInstruction || '';

        if (prompt.includes('Analyze this message:')) {
          return { text: `[{"type":"context","content":"John Doe","explanation":"Person mentioned"}]` };
        }
        if (sysPrompt.includes('You are Prompt D, an AI project companion.')) {
          return { text: 'Hello from AI' };
        }
        return { text: 'Unknown prompt' };
      })
    };
  }
}));

describe('AI Context and Conversation Logic', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptd-test-'));
    initDb(tempDir);
    const p = api.createProject('Test Project');
    api.setSetting('active_project_id', p.id);
  });

  afterEach(() => {
    closeDb();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('handles multi-turn conversation arrays properly', async () => {
    const messages: aiAdapter.Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
      { role: 'user', content: 'How are you?' }
    ];
    const reply = await aiAdapter.generateContent(messages, {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      systemPrompt: 'You are Prompt D, an AI project companion.'
    });
    // the mock returns "Hello from AI" if it spots "Prompt D"
    expect(reply).toBe('Hello from AI');
  });

  it('generates context detection JSON properly', async () => {
    const reply = await aiAdapter.generateContent('Analyze this message: "I talked to John Doe today."', { provider: 'gemini', model: 'gemini-2.5-flash' });
    const parsed = JSON.parse(reply);
    expect(parsed).toEqual([{ type: 'context', content: 'John Doe', explanation: 'Person mentioned' }]);
  });
});
