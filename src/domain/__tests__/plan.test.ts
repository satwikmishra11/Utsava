import { describe, it, expect } from 'vitest';
import { createPlanFromWizard } from '../plan';

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
});
