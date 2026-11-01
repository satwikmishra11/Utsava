import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { GeminiProvider, GeminiProviderError } from '../geminiProvider';

describe('GeminiProvider Unit Tests', () => {
  const FAKE_KEY = 'test-gemini-api-key-12345';
  let mockGenerateContent: ReturnType<typeof vi.fn>;
  let mockGenerateContentStream: ReturnType<typeof vi.fn>;
  let mockClient: GoogleGenAI;
  let provider: GeminiProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent = vi.fn();
    mockGenerateContentStream = vi.fn();
    mockClient = {
      models: {
        generateContent: mockGenerateContent,
        generateContentStream: mockGenerateContentStream,
      },
    } as unknown as GoogleGenAI;

    provider = new GeminiProvider(FAKE_KEY, 'gemini-2.5-flash', mockClient);
  });

  it('initializes with model and apiKey', () => {
    expect(provider.name).toBe('gemini');
    expect(provider.model).toBe('gemini-2.5-flash');
  });

  it('throws error when initialized without key or client', () => {
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    expect(() => new GeminiProvider(undefined)).toThrowError(/GEMINI_API_KEY/);
    process.env.GEMINI_API_KEY = original;
  });

  it('generates text completion with thinking minimization and bounded tokens', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'Gemini generated response',
    });

    const result = await provider.generateText('Suggest catering ideas', {
      temperature: 0.7,
      maxTokens: 500,
      systemPrompt: 'Event planning assistant',
    });

    expect(result).toBe('Gemini generated response');
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: 'Suggest catering ideas',
      config: expect.objectContaining({
        temperature: 0.7,
        maxOutputTokens: 500,
        systemInstruction: 'Event planning assistant',
        thinkingConfig: { thinkingBudget: 0 },
        abortSignal: expect.any(Object),
      }),
    });
  });

  it('extracts structured data validated by zod schema in JSON mode', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '{"title": "Grand Gala", "guestCount": 150}',
    });

    const schema = z.object({
      title: z.string(),
      guestCount: z.number(),
    });

    const result = await provider.generateStructured('Extract event', schema);
    expect(result).toEqual({ title: 'Grand Gala', guestCount: 150 });
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        }),
      })
    );
  });

  it('handles fenced JSON blocks during structured generation', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '```json\n{"score": 98}\n```',
    });

    const schema = z.object({ score: z.number() });
    const result = await provider.generateStructured('Score test', schema);
    expect(result.score).toBe(98);
  });

  it('retries once on 429 status code and succeeds', async () => {
    mockGenerateContent
      .mockRejectedValueOnce({
        status: 429,
        message: 'Rate limit exceeded: retry in 0.5s',
      })
      .mockResolvedValueOnce({
        text: 'Recovered after rate limit',
      });

    const result = await provider.generateText('Prompt with rate limit');
    expect(result).toBe('Recovered after rate limit');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('retries once on 503 status code and succeeds', async () => {
    mockGenerateContent
      .mockRejectedValueOnce({
        status: 503,
        message: 'Service Unavailable',
        retryDelay: 500,
      })
      .mockResolvedValueOnce({
        text: 'Recovered after 503',
      });

    const result = await provider.generateText('Prompt with 503');
    expect(result).toBe('Recovered after 503');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('redacts API key if present in error message on permanent failure', async () => {
    mockGenerateContent.mockRejectedValue({
      status: 400,
      message: `Invalid token: ${FAKE_KEY} unauthorized`,
    });

    await expect(provider.generateText('Failing prompt')).rejects.toThrowError(GeminiProviderError);

    try {
      await provider.generateText('Failing prompt');
    } catch (err: unknown) {
      const msg = (err as GeminiProviderError).message;
      expect(msg).not.toContain(FAKE_KEY);
      expect(msg).toContain('[REDACTED_API_KEY]');
    }
  });

  it('streams text chunks using generateContentStream', async () => {
    async function* fakeStream() {
      yield { text: 'Part 1 ' };
      yield { text: 'Part 2' };
    }

    mockGenerateContentStream.mockResolvedValueOnce(fakeStream());

    const stream = await provider.streamText('Stream prompt');
    const reader = stream.getReader();

    const chunk1 = await reader.read();
    expect(chunk1.value).toBe('Part 1 ');
    const chunk2 = await reader.read();
    expect(chunk2.value).toBe('Part 2');
    const done = await reader.read();
    expect(done.done).toBe(true);
  });

  it('throws GeminiProviderError when retry fails a second time', async () => {
    mockGenerateContent
      .mockRejectedValueOnce({
        status: 429,
        message: 'Rate limit exceeded: retry in 0.5s',
      })
      .mockRejectedValueOnce({
        status: 429,
        message: 'Rate limit still active',
      });

    await expect(provider.generateText('Prompt with persistent 429')).rejects.toThrowError(
      GeminiProviderError
    );
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('handles stream iteration errors gracefully', async () => {
    async function* failingStream() {
      yield { text: 'Starting chunk ' };
      throw new Error('Stream interrupted by network');
    }

    mockGenerateContentStream.mockResolvedValueOnce(failingStream());

    const stream = await provider.streamText('Failing stream prompt');
    const reader = stream.getReader();

    const chunk1 = await reader.read();
    expect(chunk1.value).toBe('Starting chunk ');
    await expect(reader.read()).rejects.toThrow('Stream interrupted by network');
  });
});
