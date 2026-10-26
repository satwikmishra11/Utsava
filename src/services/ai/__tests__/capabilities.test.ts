import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateBudgetPlan,
  generateTimeline,
  generateVendorChecklist,
  generateIdeas,
  executeChatAssistant,
} from '../capabilities';
import { PersonalizationContext } from '../types';
import { MockProvider } from '../../llm/mockProvider';
import { generationCache } from '../../cacheService';
import { EventPlan } from '@/domain/types';

describe('AI Layer Capabilities with MockProvider', () => {
  const context: PersonalizationContext = {
    eventType: 'wedding',
    culture: 'South Asian',
    budgetBand: 'moderate',
    totalBudget: 25000,
    currency: 'INR',
    guestCount: 150,
    dietary: ['Vegetarian'],
    accessibilityNeeds: ['Wheelchair Ramp'],
    location: 'Chicago, IL',
    eventDate: '2026-10-15',
  };

  const samplePlan: EventPlan = {
    id: 'evt-1',
    title: 'Ananya & Rohan Wedding',
    eventType: 'wedding',
    date: '2026-10-15',
    guestCount: 150,
    totalBudget: 25000,
    currency: 'INR',
    culturalContext: 'South Asian',
    budgetItems: [],
    timelineItems: [],
    vendors: [],
    ideas: [],
  };

  beforeEach(() => {
    generationCache.clear();
  });

  it('generates structured budget plan and caches identical requests', async () => {
    const provider = new MockProvider();
    const res1 = await generateBudgetPlan(context, { provider });
    expect(res1.source).toBe('llm');
    expect(res1.data.items.length).toBeGreaterThan(0);
    expect(res1.data.currency).toBe('INR');

    // Second call should return cached data
    const res2 = await generateBudgetPlan(context, { provider });
    expect(res2.data.items).toEqual(res1.data.items);
  });

  it('falls back to Phase 2 budget allocation when provider fails', async () => {
    const failingProvider = new MockProvider();
    failingProvider.setFailureCount(5);

    const res = await generateBudgetPlan(context, { provider: failingProvider, skipCache: true });
    expect(res.source).toBe('fallback');
    expect(res.data.items.length).toBeGreaterThan(0);
    // Context-aware fallback allocates budget based on advisor rules
    const venueItem = res.data.items.find((i) => i.category === 'venue');
    expect(venueItem?.estimated).toBe(8000);
  });

  it('generates structured timeline and falls back on error', async () => {
    const provider = new MockProvider();
    const res = await generateTimeline(context, { provider });
    expect(res.data.tasks.length).toBeGreaterThan(0);

    const failingProvider = new MockProvider();
    failingProvider.setFailureCount(5);
    const fallbackRes = await generateTimeline(context, {
      provider: failingProvider,
      skipCache: true,
    });
    expect(fallbackRes.source).toBe('fallback');
    expect(fallbackRes.data.tasks.some((t) => t.title.includes('Venue'))).toBe(true);
  });

  it('generates vendor checklist and falls back on error', async () => {
    const provider = new MockProvider();
    const res = await generateVendorChecklist(context, { provider });
    expect(res.data.vendors.length).toBeGreaterThan(0);

    const failingProvider = new MockProvider();
    failingProvider.setFailureCount(5);
    const fallbackRes = await generateVendorChecklist(context, {
      provider: failingProvider,
      skipCache: true,
    });
    expect(fallbackRes.source).toBe('fallback');
    expect(fallbackRes.data.vendors.length).toBeGreaterThan(0);
  });

  it('generates ideas and falls back to mock recommendations on error', async () => {
    const provider = new MockProvider();
    const res = await generateIdeas(context, { provider });
    expect(res.data.ideas.length).toBeGreaterThan(0);

    const failingProvider = new MockProvider();
    failingProvider.setFailureCount(5);
    const fallbackRes = await generateIdeas(context, {
      provider: failingProvider,
      skipCache: true,
    });
    expect(fallbackRes.source).toBe('fallback');
    expect(fallbackRes.data.ideas.length).toBe(4);
  });

  it('chat assistant executes tool calls and updates the plan immutably', async () => {
    const provider = new MockProvider();
    const result = await executeChatAssistant(
      {
        message: 'Can you increase the catering budget to 3200?',
        eventPlan: samplePlan,
        provider,
      },
      samplePlan
    );

    expect(result.replyText.length).toBeGreaterThan(0);
    expect(result.toolCalls.length).toBe(1);
    expect(result.toolCalls[0]?.tool).toBe('update_budget_item');
    expect(result.updatedPlan?.budgetItems.some((b) => b.category === 'catering')).toBe(true);
  });

  it('chat assistant refuses out-of-scope requests with polite explanation', async () => {
    const provider = new MockProvider();
    const result = await executeChatAssistant({
      message: 'Write a python script to parse CSV files',
      eventPlan: samplePlan,
      provider,
    });

    expect(result.replyText).toContain('dedicated to event planning');
    expect(result.toolCalls).toHaveLength(0);
  });
});
