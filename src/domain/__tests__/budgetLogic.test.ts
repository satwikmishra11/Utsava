import { describe, it, expect } from 'vitest';
import {
  DEFAULT_BUDGET_PERCENTAGES,
  allocateBudget,
  rebalanceBudget,
  detectOverspend,
  calculateBudgetSummary,
  calculatePerGuestCost,
} from '../budget';
import { BudgetItem } from '../schemas';

describe('Budget Logic Pure Functions', () => {
  it('verifies default percentage splits sum exactly to 100 for all event types', () => {
    for (const type of ['wedding', 'birthday', 'community'] as const) {
      const splits = DEFAULT_BUDGET_PERCENTAGES[type];
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    }
  });

  it('allocates budget according to event type percentages', () => {
    const allocations = allocateBudget('wedding', 100000);
    expect(allocations.venue).toBe(35000); // 35%
    expect(allocations.catering).toBe(25000); // 25%
    expect(allocations.photography).toBe(12000); // 12%

    const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
    expect(totalAllocated).toBe(100000);
  });

  it('rebalances remaining categories proportionally when one category changes', () => {
    const initial = allocateBudget('wedding', 10000);
    // Initial venue was 3500 (35%). Suppose user increases venue to 5000 (+1500)
    const rebalanced = rebalanceBudget(initial, 'venue', 5000, 10000);

    expect(rebalanced.venue).toBe(5000);
    const sum = Object.values(rebalanced).reduce((a, b) => a + b, 0);
    // Sum should remain within rounding tolerance of 10000
    expect(Math.abs(sum - 10000)).toBeLessThanOrEqual(0.1);
  });

  it('rebalances evenly when other categories were previously zero', () => {
    const zeroOthers = {
      venue: 10000,
      catering: 0,
      photography: 0,
      decor: 0,
      entertainment: 0,
      attire: 0,
      logistics: 0,
      miscellaneous: 0,
    };

    const rebalanced = rebalanceBudget(zeroOthers, 'venue', 3000, 10000);
    expect(rebalanced.venue).toBe(3000);
    expect(rebalanced.catering).toBe(1000); // 7000 / 7 = 1000
  });

  it('detects overspend when total expenses exceed total budget', () => {
    const items: BudgetItem[] = [
      { id: '1', eventId: 'e', category: 'venue', estimated: 5000, actual: 5500 },
      { id: '2', eventId: 'e', category: 'catering', estimated: 3000, actual: 3000 },
    ];
    const analysis = detectOverspend(8000, items);

    expect(analysis.isOverspent).toBe(true);
    expect(analysis.totalSpent).toBe(8500);
    expect(analysis.variance).toBe(-500);
    expect(analysis.overspentPercentage).toBe(6.3);
    expect(analysis.categoryTotals.venue).toBe(5500);
  });

  it('reports positive variance when within budget', () => {
    const items: BudgetItem[] = [
      { id: '1', eventId: 'e', category: 'venue', estimated: 4000, actual: 4000 },
    ];
    const analysis = detectOverspend(10000, items);

    expect(analysis.isOverspent).toBe(false);
    expect(analysis.variance).toBe(6000);
    expect(analysis.overspentPercentage).toBe(0);
  });

  it('calculates cost per guest metrics accurately', () => {
    const items: BudgetItem[] = [
      { id: '1', eventId: 'e', category: 'venue', estimated: 20000, actual: 20000 },
      { id: '2', eventId: 'e', category: 'catering', estimated: 10000, actual: 10000 },
    ];
    const summary = calculateBudgetSummary(50000, items);
    const perGuest = calculatePerGuestCost(summary, 100);

    expect(perGuest.budgetPerGuest).toBe(500);
    expect(perGuest.estimatedPerGuest).toBe(300);
    expect(perGuest.actualPerGuest).toBe(300);
    expect(perGuest.variancePerGuest).toBe(200);
  });

  it('safely handles zero or negative guest counts by defaulting divisor to 1', () => {
    const summary = calculateBudgetSummary(5000, []);
    const perGuest = calculatePerGuestCost(summary, 0);

    expect(perGuest.budgetPerGuest).toBe(5000);
  });
});
