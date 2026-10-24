import { describe, it, expect, beforeEach } from 'vitest';
import { tokenTracker, estimateTokenCount } from '../tokenTracker';

describe('AI Token Tracking & Monitoring Suite', () => {
  beforeEach(() => {
    tokenTracker.clear();
  });

  it('estimates token count from text accurately', () => {
    expect(estimateTokenCount('')).toBe(0);
    expect(estimateTokenCount('hello world')).toBe(3); // 11 chars / 4 rounded up
    expect(estimateTokenCount('a'.repeat(400))).toBe(100);
  });

  it('records token usage and updates summary correctly', () => {
    tokenTracker.record({
      capability: 'budget',
      promptTokens: 200,
      completionTokens: 400,
      durationMs: 450,
      model: 'claude-3-5-sonnet',
      cached: false,
    });

    tokenTracker.record({
      capability: 'timeline',
      promptTokens: 100,
      completionTokens: 200,
      durationMs: 1,
      model: 'generation-cache',
      cached: true,
    });

    const summary = tokenTracker.getSummary();
    expect(summary.totalTokens).toBe(900);
    expect(summary.promptTokens).toBe(300);
    expect(summary.completionTokens).toBe(600);
    expect(summary.requestCount).toBe(2);
    expect(summary.cacheHitCount).toBe(1);
    expect(summary.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('notifies subscribers upon recording new usage', () => {
    let callCount = 0;
    const unsubscribe = tokenTracker.subscribe(() => {
      callCount++;
    });

    tokenTracker.record({
      capability: 'chat',
      promptTokens: 50,
      completionTokens: 50,
      durationMs: 200,
      model: 'claude-3-5-sonnet',
      cached: false,
    });

    expect(callCount).toBe(1);
    unsubscribe();

    tokenTracker.record({
      capability: 'ideas',
      promptTokens: 50,
      completionTokens: 50,
      durationMs: 100,
      model: 'claude-3-5-sonnet',
      cached: false,
    });

    expect(callCount).toBe(1);
  });
});
