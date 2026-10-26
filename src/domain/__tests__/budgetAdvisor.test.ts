import { describe, it, expect } from 'vitest';
import { adviseBudgetSplit } from '../budgetAdvisor';

describe('Budget Advisor Domain Engine (src/domain/budgetAdvisor.ts)', () => {
  it('shifts points to catering when per-guest cost is low for INR wedding', () => {
    // 300 guests, ₹30,000 -> ₹100/guest (< min ₹150)
    const result = adviseBudgetSplit({
      eventType: 'wedding',
      totalBudget: 30000,
      currency: 'INR',
      guestCount: 300,
      daysUntilEvent: 90,
    });

    const sum = Object.values(result.percentages).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
    expect(result.reasons.some((r) => r.includes('below reference range'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('Large guest list'))).toBe(true);
  });

  it('shifts points to decor and photography when per-guest cost is high', () => {
    // 20 guests, ₹10,000 -> ₹500/guest (> max ₹120 for birthday)
    const result = adviseBudgetSplit({
      eventType: 'birthday',
      totalBudget: 10000,
      currency: 'INR',
      guestCount: 20,
      daysUntilEvent: 60,
    });

    const sum = Object.values(result.percentages).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
    expect(result.reasons.some((r) => r.includes('exceeds reference range'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('Intimate guest list'))).toBe(true);
  });

  it('skips per-guest rule for non-INR currencies', () => {
    const result = adviseBudgetSplit({
      eventType: 'wedding',
      totalBudget: 50000,
      currency: 'USD',
      guestCount: 100,
      daysUntilEvent: 90,
    });

    expect(result.reasons.some((r) => r.includes('reference range'))).toBe(false);
  });

  it('shifts points for intimate guest list <= 50', () => {
    const result = adviseBudgetSplit({
      eventType: 'community',
      totalBudget: 2000,
      currency: 'USD',
      guestCount: 25,
      daysUntilEvent: 45,
    });

    expect(result.reasons.some((r) => r.includes('Intimate guest list'))).toBe(true);
  });

  it('allocates +2% catering for two or more dietary requirements', () => {
    const result = adviseBudgetSplit({
      eventType: 'wedding',
      totalBudget: 50000,
      currency: 'USD',
      guestCount: 100,
      dietary: ['Jain Vegetarian', 'Nut-Free', 'Halal'],
      daysUntilEvent: 90,
    });

    expect(result.reasons.some((r) => r.includes('Multiple dietary requirements'))).toBe(true);
  });

  it('allocates +3% logistics for accessibility accommodations', () => {
    const result = adviseBudgetSplit({
      eventType: 'community',
      totalBudget: 10000,
      currency: 'USD',
      guestCount: 100,
      accessibilityNeeds: ['Wheelchair Ramps', 'ASL Interpretation'],
      daysUntilEvent: 90,
    });

    expect(result.reasons.some((r) => r.includes('Accessibility accommodations'))).toBe(true);
  });

  it('allocates +3% miscellaneous for rush planning window < 30 days', () => {
    const result = adviseBudgetSplit({
      eventType: 'birthday',
      totalBudget: 4000,
      currency: 'USD',
      guestCount: 60,
      daysUntilEvent: 14,
    });

    expect(result.reasons.some((r) => r.includes('Short planning window'))).toBe(true);
  });

  it('always clamps at >= 0 and normalizes sum to exactly 100', () => {
    const result = adviseBudgetSplit({
      eventType: 'wedding',
      totalBudget: 15000,
      currency: 'INR',
      guestCount: 400, // Large + Low cost
      dietary: ['Vegan', 'Gluten-Free'],
      accessibilityNeeds: ['Braille signage'],
      daysUntilEvent: 7, // Rush
    });

    for (const pct of Object.values(result.percentages)) {
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(pct)).toBe(true);
    }
    const sum = Object.values(result.percentages).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('validates input schema and rejects invalid inputs', () => {
    expect(() =>
      adviseBudgetSplit({
        eventType: 'invalid_type' as unknown as 'wedding',
        totalBudget: 5000,
        currency: 'INR',
        guestCount: 50,
      })
    ).toThrow();
  });
});
