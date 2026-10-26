import { describe, it, expect } from 'vitest';
import { createPlanFromWizard, createPlanWithTimeline } from '../plan';
import { DEFAULT_TIMELINE_TEMPLATES } from '../timelineLogic';

describe('createPlanFromWizard', () => {
  it('creates an EventPlan with empty collections and matches input properties', () => {
    const input = {
      title: 'Grand Gala',
      eventType: 'wedding' as const,
      date: '2026-12-25',
      guestCount: 200,
      totalBudget: 50000,
      currency: 'INR',
      culture: 'South Asian',
    };

    const plan = createPlanFromWizard(input, 'evt-fixed-id');
    expect(plan.id).toBe('evt-fixed-id');
    expect(plan.title).toBe('Grand Gala');
    expect(plan.eventType).toBe('wedding');
    expect(plan.date).toBe('2026-12-25');
    expect(plan.guestCount).toBe(200);
    expect(plan.totalBudget).toBe(50000);
    expect(plan.currency).toBe('INR');
    expect(plan.culturalContext).toBe('South Asian');
    expect(plan.budgetItems).toEqual([]);
    expect(plan.timelineItems).toEqual([]);
    expect(plan.vendors).toEqual([]);
    expect(plan.ideas).toEqual([]);
  });

  it('generates a fallback ID when not provided', () => {
    const plan = createPlanFromWizard({
      title: 'Birthday Bash',
      eventType: 'birthday' as const,
      date: '2026-11-10',
      guestCount: 30,
      totalBudget: 2000,
      currency: 'USD',
    });
    expect(plan.id).toMatch(/^evt-\d+$/);
    expect(plan.culturalContext).toBeUndefined();
  });

  it('creates plan with scheduled timeline items when today and templates are provided', () => {
    const input = {
      title: 'Rush Wedding',
      eventType: 'wedding' as const,
      date: '2026-11-16',
      guestCount: 150,
      totalBudget: 40000,
      currency: 'INR',
    };
    const today = '2026-10-26'; // 21 days away

    const plan = createPlanFromWizard(input, 'evt-rush', today, DEFAULT_TIMELINE_TEMPLATES);
    expect(plan.timelineItems.length).toBeGreaterThan(0);
    expect(plan.timelineItems[0]?.flags).toContain('compressed');
  });
});

describe('createPlanWithTimeline', () => {
  it('creates an EventPlan with populated timeline items based on injected today', () => {
    const input = {
      title: 'Spring Festival',
      eventType: 'community' as const,
      date: '2026-05-01',
      guestCount: 500,
      totalBudget: 25000,
      currency: 'INR',
    };
    const today = '2026-04-10'; // 21 days away, compressed

    const plan = createPlanWithTimeline(input, today, DEFAULT_TIMELINE_TEMPLATES, 'evt-fest');
    expect(plan.id).toBe('evt-fest');
    expect(plan.timelineItems.length).toBe(DEFAULT_TIMELINE_TEMPLATES.length);
    expect(plan.timelineItems.some((t) => t.isCompressed)).toBe(true);
  });
});
