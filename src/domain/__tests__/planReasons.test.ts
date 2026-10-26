import { describe, it, expect } from 'vitest';
import { getPlanReasons } from '../planReasons';
import { EventPlan } from '../types';

describe('getPlanReasons Domain Logic', () => {
  const basePlan: EventPlan = {
    id: 'evt-test-1',
    title: 'Test Wedding Celebration',
    eventType: 'wedding',
    date: '2026-11-16', // 21 days from today
    guestCount: 300,
    totalBudget: 60000,
    currency: 'INR',
    culturalContext: 'South Asian',
    dietary: ['Vegetarian', 'Jain'],
    accessibilityNeeds: ['Wheelchair Ramp'],
    budgetItems: [],
    timelineItems: [],
    vendors: [],
    ideas: [],
  };

  const today = '2026-10-26';

  it('computes explainable budget reasons based on guest count, dietary, and accessibility', () => {
    const reasons = getPlanReasons(basePlan, today);
    expect(reasons.budgetReasons.length).toBeGreaterThan(0);
    expect(reasons.budgetReasons.some((r) => r.includes('Large guest list'))).toBe(true);
    expect(reasons.budgetReasons.some((r) => r.includes('dietary'))).toBe(true);
    expect(reasons.budgetReasons.some((r) => r.includes('Accessibility accommodations'))).toBe(
      true
    );
  });

  it('computes timeline compression and overdue reasons when lead times exceed days remaining', () => {
    const reasons = getPlanReasons(basePlan, today);
    expect(reasons.timelineReasons.length).toBeGreaterThan(0);
    expect(reasons.timelineReasons.some((r) => r.includes('compressed'))).toBe(true);
  });

  it('aggregates budget and timeline reasons in allReasons array', () => {
    const reasons = getPlanReasons(basePlan, today);
    expect(reasons.allReasons.length).toBe(
      reasons.budgetReasons.length + reasons.timelineReasons.length
    );
  });

  it('uses pre-existing plan.budgetReasons and plan.timelineReasons if already attached', () => {
    const customPlan: EventPlan = {
      ...basePlan,
      budgetReasons: ['Custom budget rule applied'],
      timelineReasons: ['Custom timeline schedule factor'],
    };
    const reasons = getPlanReasons(customPlan, today);
    expect(reasons.budgetReasons).toEqual(['Custom budget rule applied']);
    expect(reasons.timelineReasons).toEqual(['Custom timeline schedule factor']);
    expect(reasons.allReasons).toEqual([
      'Custom budget rule applied',
      'Custom timeline schedule factor',
    ]);
  });

  it('handles invalid plan date gracefully without throwing', () => {
    const brokenDatePlan: EventPlan = {
      ...basePlan,
      date: 'invalid-date',
    };
    const reasons = getPlanReasons(brokenDatePlan, today);
    expect(Array.isArray(reasons.budgetReasons)).toBe(true);
    expect(Array.isArray(reasons.timelineReasons)).toBe(true);
  });
});
