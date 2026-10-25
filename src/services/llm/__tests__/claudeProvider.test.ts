import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeProvider } from '../claudeProvider';
import { z } from 'zod';

const mockCreate = vi.fn();
const mockStream = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
        stream: mockStream,
      };
    },
  };
});

describe('ClaudeProvider Unit Tests', () => {
  const FAKE_KEY = 'sk-ant-api-test-key-12345';
  let provider: ClaudeProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new ClaudeProvider(FAKE_KEY);
  });

  it('initializes with model name and API key', () => {
    expect(provider.name).toBe('claude');
  });

  it('throws helpful error when initialized without an API key', () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    expect(() => new ClaudeProvider(undefined)).toThrow(
      'ClaudeProvider requires ANTHROPIC_API_KEY'
    );
    process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it('calls messages.create and extracts text response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Hello from Claude' }],
    });

    const result = await provider.generateText('Tell me an event idea', {
      maxTokens: 500,
      systemPrompt: 'You are an event planner',
    });

    expect(result).toBe('Hello from Claude');
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: 'You are an event planner',
      messages: [{ role: 'user', content: 'Tell me an event idea' }],
    });
  });

  it('returns empty string if content block is not text', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [],
    });

    const result = await provider.generateText('Test prompt');
    expect(result).toBe('');
  });

  it('streams text chunks via ReadableStream', async () => {
    const eventHandlers: Record<string, (arg?: unknown) => void> = {};
    mockStream.mockReturnValueOnce({
      on: (event: string, handler: (arg?: unknown) => void) => {
        eventHandlers[event] = handler;
      },
    });

    const stream = await provider.streamText('Stream me a poem');
    const reader = stream.getReader();

    // Trigger chunk events
    setTimeout(() => {
      eventHandlers['text']?.('Chunk 1 ');
      eventHandlers['text']?.('Chunk 2');
      eventHandlers['end']?.();
    }, 10);

    const chunk1 = await reader.read();
    expect(chunk1.value).toBe('Chunk 1 ');
    const chunk2 = await reader.read();
    expect(chunk2.value).toBe('Chunk 2');
    const done = await reader.read();
    expect(done.done).toBe(true);
  });

  it('handles stream errors correctly', async () => {
    const eventHandlers: Record<string, (arg?: unknown) => void> = {};
    mockStream.mockReturnValueOnce({
      on: (event: string, handler: (arg?: unknown) => void) => {
        eventHandlers[event] = handler;
      },
    });

    const stream = await provider.streamText('Error test');
    const reader = stream.getReader();

    setTimeout(() => {
      eventHandlers['error']?.(new Error('Anthropic rate limit'));
    }, 10);

    await expect(reader.read()).rejects.toThrow('Anthropic rate limit');
  });

  it('generates and validates structured output matching Zod schema', async () => {
    const schema = z.object({
      category: z.string(),
      estimatedCost: z.number(),
    });

    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '```json\n{"category": "catering", "estimatedCost": 4500}\n```',
        },
      ],
    });

    const data = await provider.generateStructured('Estimate catering', schema);
    expect(data).toEqual({
      category: 'catering',
      estimatedCost: 4500,
    });
  });
});
