import { describe, it, expect } from 'vitest';
import {
  buildFallbackBudgetPlan,
  buildFallbackTimeline,
  buildFallbackVendorChecklist,
  buildFallbackIdeas,
  computeDaysUntilEvent,
} from '../fallbacks';
import { PersonalizationContext } from '../types';

describe('AI Fallbacks Engine (src/services/ai/fallbacks.ts)', () => {
  it('computes days until event with injected today date', () => {
    expect(computeDaysUntilEvent('2026-11-15', '2026-11-01')).toBe(14);
    expect(computeDaysUntilEvent('2026-11-01', '2026-11-15')).toBe(-14);
    expect(computeDaysUntilEvent(undefined, '2026-11-01')).toBeUndefined();
    expect(computeDaysUntilEvent('not-a-date', '2026-11-01')).toBeUndefined();
  });

  it('builds context-aware fallback budget plan with explainable reasons in item notes', () => {
    const context: PersonalizationContext = {
      eventType: 'wedding',
      guestCount: 300, // Large guest list
      totalBudget: 30000, // Low per-guest for wedding (< 150)
      currency: 'INR',
      dietary: ['Jain', 'Vegan'],
      accessibilityNeeds: ['Wheelchair Ramp'],
      eventDate: '2026-11-05',
    };

    // Inject today as 2026-11-01 (4 days remaining -> rush contingency)
    const plan = buildFallbackBudgetPlan(context, '2026-11-01');

    expect(plan.currency).toBe('INR');
    expect(plan.totalAllocated).toBe(30000);
    expect(plan.items.length).toBeGreaterThan(0);

    const firstItem = plan.items[0];
    expect(firstItem).toBeDefined();
    if (firstItem) {
      expect(firstItem.notes).toContain('below reference range');
      expect(firstItem.notes).toContain('Large guest list');
      expect(firstItem.notes).toContain('Multiple dietary requirements');
      expect(firstItem.notes).toContain('Accessibility accommodations');
      expect(firstItem.notes).toContain('Short planning window');
    }
  });

  it('builds standard fallback budget plan when context is minimal', () => {
    const minimal: PersonalizationContext = {
      eventType: 'birthday',
      guestCount: 60,
    };

    const plan = buildFallbackBudgetPlan(minimal);
    expect(plan.totalAllocated).toBe(10000); // DEFAULT_FALLBACK_BUDGET
    expect(plan.items.length).toBe(8);
  });

  it('builds deterministic fallback timeline, vendors, and ideas', () => {
    const context: PersonalizationContext = {
      eventType: 'community',
      guestCount: 150,
      eventDate: '2026-12-01',
      culture: 'Festival',
    };

    const timeline = buildFallbackTimeline(context);
    expect(timeline.tasks.length).toBe(5);
    expect(timeline.tasks[0]?.dueDate).toBeDefined();

    const vendors = buildFallbackVendorChecklist(context);
    expect(vendors.vendors.length).toBeGreaterThan(0);

    const ideas = buildFallbackIdeas(context);
    expect(ideas.ideas.length).toBeGreaterThan(0);
  });
});
