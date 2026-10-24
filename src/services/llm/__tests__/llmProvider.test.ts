import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { MockProvider } from '../mockProvider';
import { getLLMProvider } from '../index';
import { ClaudeProvider } from '../claudeProvider';

describe('LLMProvider Architecture & Swappability', () => {
  it('MockProvider streams text accurately', async () => {
    const provider = new MockProvider('Hello Utsava Event Planner');
    const stream = await provider.streamText('Plan');
    const reader = stream.getReader();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += value;
    }

    expect(accumulated.trim()).toBe('Hello Utsava Event Planner');
  });

  it('MockProvider generates structured data matching Zod schema', async () => {
    const schema = z.array(
      z.object({
        id: z.string(),
        category: z.string(),
        title: z.string(),
        description: z.string(),
        estimatedCostTier: z.string(),
        tags: z.array(z.string()),
      })
    );

    const provider = new MockProvider();
    const result = await provider.generateStructured('Give me ideas', schema);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Mock Heritage Theme');
  });

  it('getLLMProvider returns MockProvider by default', () => {
    const provider = getLLMProvider();
    expect(provider.name).toBe('mock');
  });

  it('ClaudeProvider throws helpful error if initialized without API key', () => {
    expect(() => new ClaudeProvider('')).toThrowError(/ANTHROPIC_API_KEY/);
  });
});
