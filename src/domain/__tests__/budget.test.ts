import { describe, it, expect } from 'vitest';
import {
  calculateCategoryAllocations,
  calculateBudgetSummary,
  addBudgetItem,
  updateBudgetItem,
  removeBudgetItem,
  detectBudgetRisks,
} from '../budget';
import { BudgetItem } from '../schemas';

describe('Budget Domain Functions', () => {
  const sampleItems: readonly BudgetItem[] = [
    {
      id: 'b-1',
      eventId: 'evt-1',
      category: 'venue',
      estimated: 5000,
      actual: 5200,
      notes: 'Banquet Hall',
    },
    {
      id: 'b-2',
      eventId: 'evt-1',
      category: 'catering',
      estimated: 3000,
      actual: 2800,
      notes: 'Buffet Dinner',
    },
  ];

  it('calculates category allocations correctly', () => {
    const allocations = calculateCategoryAllocations(sampleItems);
    const venue = allocations.find((a) => a.category === 'venue');
    const catering = allocations.find((a) => a.category === 'catering');

    expect(venue?.allocated).toBe(5000);
    expect(venue?.percentage).toBe(62.5);
    expect(catering?.allocated).toBe(3000);
    expect(catering?.percentage).toBe(37.5);
  });

  it('calculates summary with under-budget variance', () => {
    const summary = calculateBudgetSummary(10000, sampleItems);
    expect(summary.totalBudget).toBe(10000);
    expect(summary.totalEstimated).toBe(8000);
    expect(summary.totalActual).toBe(8000);
    expect(summary.totalPaid).toBe(8000);
    expect(summary.remainingBudget).toBe(2000);
    expect(summary.isOverBudget).toBe(false);
  });

  it('calculates summary when over budget', () => {
    const summary = calculateBudgetSummary(7000, sampleItems);
    expect(summary.remainingBudget).toBe(-1000);
    expect(summary.isOverBudget).toBe(true);
  });

  it('adds item immutably', () => {
    const newItem: BudgetItem = {
      id: 'b-3',
      eventId: 'evt-1',
      category: 'decor',
      estimated: 800,
      actual: 0,
      notes: 'Floral Centerpieces',
    };
    const next = addBudgetItem(sampleItems, newItem);
    expect(next).toHaveLength(3);
    expect(sampleItems).toHaveLength(2);
  });

  it('updates item immutably', () => {
    const firstItem = sampleItems[0];
    expect(firstItem).toBeDefined();
    if (!firstItem) return;
    const updated: BudgetItem = {
      ...firstItem,
      actual: 5500,
    };
    const next = updateBudgetItem(sampleItems, updated);
    expect(next[0]?.actual).toBe(5500);
    expect(sampleItems[0]?.actual).toBe(5200);
  });

  it('removes item immutably', () => {
    const next = removeBudgetItem(sampleItems, 'b-1');
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe('b-2');
  });

  it('detects budget risks when exceeded', () => {
    const summary = calculateBudgetSummary(7000, sampleItems);
    const risks = detectBudgetRisks(summary);
    expect(risks.some((r) => r.includes('Budget exceeded'))).toBe(true);
  });

  it('warns when booked vendor commitments exceed 50% of total budget', () => {
    const summary = calculateBudgetSummary(10000, sampleItems);
    const vendors = [{ id: 'v-1', status: 'booked' as const, quotedAmount: 6000 }];
    const risks = detectBudgetRisks(summary, vendors);
    expect(risks).toContain('High concentration of unpaid commitments (>50% of budget).');
  });

  it('extracts quote from Vendor objects using quote property or missing quote', () => {
    const summary = calculateBudgetSummary(10000, sampleItems);
    const vendors = [
      { id: 'v-quote', status: 'booked' as const, quote: 6000 },
      { id: 'v-zero', status: 'booked' as const },
    ];
    const risks = detectBudgetRisks(summary, vendors);
    expect(risks).toContain('High concentration of unpaid commitments (>50% of budget).');
  });

  it('does not warn when booked vendor commitments are under 50% threshold', () => {
    const summary = calculateBudgetSummary(10000, sampleItems);
    const vendors = [{ id: 'v-1', status: 'booked' as const, quotedAmount: 4000 }];
    const risks = detectBudgetRisks(summary, vendors);
    expect(risks).not.toContain('High concentration of unpaid commitments (>50% of budget).');
  });

  it('ignores paid and shortlisted vendors when computing unpaid commitments', () => {
    const summary = calculateBudgetSummary(10000, sampleItems);
    const vendors = [
      { id: 'v-1', status: 'paid' as const, quotedAmount: 8000 },
      { id: 'v-2', status: 'shortlisted' as const, quote: 9000 },
    ];
    const risks = detectBudgetRisks(summary, vendors);
    expect(risks).not.toContain('High concentration of unpaid commitments (>50% of budget).');
  });

  it('handles empty vendors list without warning on unpaid commitments', () => {
    const summary = calculateBudgetSummary(10000, sampleItems);
    const risks = detectBudgetRisks(summary, []);
    expect(risks).not.toContain('High concentration of unpaid commitments (>50% of budget).');
  });

  it('warns on unusual non-venue allocations exceeding 45%', () => {
    const skewedItems: readonly BudgetItem[] = [
      {
        id: 'b-skew',
        eventId: 'evt-1',
        category: 'decor',
        estimated: 8000,
        actual: 8000,
      },
      {
        id: 'b-other',
        eventId: 'evt-1',
        category: 'catering',
        estimated: 2000,
        actual: 2000,
      },
    ];
    const summary = calculateBudgetSummary(10000, skewedItems);
    const risks = detectBudgetRisks(summary);
    expect(risks.some((r) => r.includes('Unusual allocation: decor'))).toBe(true);
  });
});
