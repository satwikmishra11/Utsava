import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { executeStructuredWithRetry } from '../structuredExecutor';
import { MockProvider } from '../../llm/mockProvider';

const TargetSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
});
type Target = z.infer<typeof TargetSchema>;

describe('StructuredExecutor with Validation, Retry & Fallback', () => {
  it('returns valid data on first attempt (source: llm)', async () => {
    const provider = new MockProvider();
    provider.setCustomStructuredHandler(() => ({ title: 'Royal Hall', amount: 5000 }));

    const result = await executeStructuredWithRetry<Target>({
      provider,
      prompt: 'Allocate venue',
      schema: TargetSchema,
      buildRetryPrompt: (p, err) => `${p} RETRY: ${err}`,
      fallback: () => ({ title: 'Fallback Venue', amount: 1000 }),
    });

    expect(result.source).toBe('llm');
    expect(result.data.title).toBe('Royal Hall');
    expect(result.data.amount).toBe(5000);
  });

  it('retries once with validation error when attempt 1 fails and succeeds (source: retry)', async () => {
    const provider = new MockProvider();
    let callCount = 0;
    let receivedRetryPrompt = '';

    provider.setCustomStructuredHandler((prompt) => {
      callCount++;
      if (callCount === 1) {
        // Return invalid data failing amount positive() validation
        return { title: 'Invalid Venue', amount: -50 };
      }
      receivedRetryPrompt = prompt;
      return { title: 'Corrected Venue', amount: 3500 };
    });

    const result = await executeStructuredWithRetry<Target>({
      provider,
      prompt: 'Allocate venue',
      schema: TargetSchema,
      buildRetryPrompt: (p, err) => `${p} RETRY: ${err}`,
      fallback: () => ({ title: 'Fallback Venue', amount: 1000 }),
    });

    expect(callCount).toBe(2);
    expect(result.source).toBe('retry');
    expect(result.data.title).toBe('Corrected Venue');
    expect(result.data.amount).toBe(3500);
    expect(receivedRetryPrompt).toContain('RETRY');
  });

  it('falls back to deterministic Phase 2 template when both attempts fail (source: fallback)', async () => {
    const provider = new MockProvider();
    let callCount = 0;

    provider.setCustomStructuredHandler(() => {
      callCount++;
      throw new Error('LLM parse timeout');
    });

    const result = await executeStructuredWithRetry<Target>({
      provider,
      prompt: 'Allocate venue',
      schema: TargetSchema,
      buildRetryPrompt: (p, err) => `${p} RETRY: ${err}`,
      fallback: () => ({ title: 'Fallback Venue', amount: 1200 }),
    });

    expect(callCount).toBe(2);
    expect(result.source).toBe('fallback');
    expect(result.data.title).toBe('Fallback Venue');
    expect(result.data.amount).toBe(1200);
  });
});
