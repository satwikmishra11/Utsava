import { describe, it, expect } from 'vitest';
import {
  calculateCategoryAllocations,
  calculateBudgetSummary,
  addBudgetItem,
  updateBudgetItem,
  removeBudgetItem,
  detectBudgetRisks,
} from '../budget';
import { BudgetItem } from '../types';

describe('Budget Domain Functions', () => {
  const sampleItems: readonly BudgetItem[] = [
    {
      id: 'b-1',
      category: 'venue',
      name: 'Banquet Hall',
      estimatedCost: 5000,
      actualCost: 5200,
      paidCost: 2000,
      status: 'booked',
    },
    {
      id: 'b-2',
      category: 'catering',
      name: 'Buffet Dinner',
      estimatedCost: 3000,
      actualCost: 2800,
      paidCost: 1000,
      status: 'booked',
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
    expect(summary.totalPaid).toBe(3000);
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
      category: 'decor',
      name: 'Floral Centerpieces',
      estimatedCost: 800,
      actualCost: 0,
      paidCost: 0,
      status: 'planned',
    };
    const next = addBudgetItem(sampleItems, newItem);
    expect(next).toHaveLength(3);
    expect(sampleItems).toHaveLength(2);
  });

  it('updates item immutably', () => {
    const updated: BudgetItem = {
      ...sampleItems[0]!,
      actualCost: 5500,
    };
    const next = updateBudgetItem(sampleItems, updated);
    expect(next[0]?.actualCost).toBe(5500);
    expect(sampleItems[0]?.actualCost).toBe(5200);
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
});
