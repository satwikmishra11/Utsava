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

  it('MockProvider generates structured vendor checklist', async () => {
    const provider = new MockProvider();
    const vendorSchema = z.object({
      vendors: z.array(
        z.object({
          name: z.string(),
          category: z.string(),
        })
      ),
    });

    const result = await provider.generateStructured('vendor checklist prompt', vendorSchema);
    expect(result.vendors).toHaveLength(1);
    expect(result.vendors[0]?.name).toBe('The Grand Pavilion');
  });

  it('MockProvider respects simulated failure count in generateText', async () => {
    const provider = new MockProvider();
    provider.setFailureCount(1);

    await expect(provider.generateText('test')).rejects.toThrow('Simulated MockProvider failure');
    const success = await provider.generateText('test 2');
    expect(success).toContain('[Mock:mock]');
  });

  it('MockProvider supports custom structured handler and JSON system prompt in generateText', async () => {
    const provider = new MockProvider();
    provider.setCustomStructuredHandler(() => ({
      custom: 'handled',
    }));

    const result = await provider.generateStructured('custom', z.object({ custom: z.string() }));
    expect(result.custom).toBe('handled');

    const jsonText = await provider.generateText('hello', { systemPrompt: 'Return JSON' });
    expect(JSON.parse(jsonText)).toHaveProperty('message', 'mocked structured response');
  });
});
