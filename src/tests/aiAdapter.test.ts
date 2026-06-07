import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as aiAdapter from '../main/aiAdapter';
import * as secureStorage from '../main/secureStorage';

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({ text: 'Mocked Gemini response' })
      };
    }
  };
});

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class {
      messages = {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Mocked Claude response' }]
        })
      };
    }
  };
});

vi.mock('keytar', () => ({
  default: {
    getPassword: vi.fn().mockImplementation(async (service, account) => {
      if (account === 'gemini') return 'fake-gemini-key';
      if (account === 'claude') return 'fake-claude-key';
      return null;
    }),
    setPassword: vi.fn().mockResolvedValue(undefined),
    deletePassword: vi.fn().mockResolvedValue(undefined),
  }
}));

describe('AI Adapter Logic', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('routes to Gemini adapter correctly and fetches from keytar', async () => {
    const result = await aiAdapter.generateContent('test prompt', {
      model: 'gemini-2.5-flash',
      provider: 'gemini'
    });

    expect(result).toBe('Mocked Gemini response');
  });

  it('routes to Claude adapter correctly and fetches from keytar', async () => {
    const result = await aiAdapter.generateContent('test prompt', {
      model: 'claude-haiku-4-5',
      provider: 'claude'
    });

    expect(result).toBe('Mocked Claude response');
  });

  it('fails gracefully if provider is unknown', async () => {
    await expect(aiAdapter.generateContent('test', { model: 'x', provider: 'unknown' as any }))
      .rejects.toThrow('unknown API key not found');
  });
});
