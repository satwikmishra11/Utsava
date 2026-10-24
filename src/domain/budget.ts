import { BudgetItem, BudgetSummary, CategoryAllocation, BudgetCategory } from './types';

export const ALL_BUDGET_CATEGORIES: readonly BudgetCategory[] = [
  'venue',
  'catering',
  'photography',
  'decor',
  'entertainment',
  'attire',
  'logistics',
  'miscellaneous',
];

export function calculateCategoryAllocations(
  items: readonly BudgetItem[]
): readonly CategoryAllocation[] {
  const totals = new Map<BudgetCategory, { allocated: number; actual: number }>();
  for (const cat of ALL_BUDGET_CATEGORIES) {
    totals.set(cat, { allocated: 0, actual: 0 });
  }

  for (const item of items) {
    const current = totals.get(item.category) ?? { allocated: 0, actual: 0 };
    totals.set(item.category, {
      allocated: current.allocated + item.estimatedCost,
      actual: current.actual + item.actualCost,
    });
  }

  const grandTotal = items.reduce((acc, item) => acc + item.estimatedCost, 0);

  return ALL_BUDGET_CATEGORIES.map((category) => {
    const data = totals.get(category) ?? { allocated: 0, actual: 0 };
    const percentage = grandTotal > 0 ? (data.allocated / grandTotal) * 100 : 0;
    return {
      category,
      allocated: Math.round(data.allocated * 100) / 100,
      actual: Math.round(data.actual * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
    };
  });
}

export function calculateBudgetSummary(
  totalBudget: number,
  items: readonly BudgetItem[]
): BudgetSummary {
  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actualCost, 0);
  const totalPaid = items.reduce((sum, item) => sum + item.paidCost, 0);
  const effectiveCost = totalActual > 0 ? totalActual : totalEstimated;
  const remainingBudget = totalBudget - effectiveCost;
  const isOverBudget = remainingBudget < 0;
  const variance = totalBudget - effectiveCost;

  return {
    totalBudget: Math.round(totalBudget * 100) / 100,
    totalEstimated: Math.round(totalEstimated * 100) / 100,
    totalActual: Math.round(totalActual * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    isOverBudget,
    variance: Math.round(variance * 100) / 100,
    categoryAllocations: calculateCategoryAllocations(items),
  };
}

export function addBudgetItem(
  items: readonly BudgetItem[],
  item: BudgetItem
): readonly BudgetItem[] {
  return [...items, Object.freeze({ ...item })];
}

export function updateBudgetItem(
  items: readonly BudgetItem[],
  updated: BudgetItem
): readonly BudgetItem[] {
  return items.map((item) => (item.id === updated.id ? Object.freeze({ ...updated }) : item));
}

export function removeBudgetItem(
  items: readonly BudgetItem[],
  id: string
): readonly BudgetItem[] {
  return items.filter((item) => item.id !== id);
}

export function detectBudgetRisks(summary: BudgetSummary): readonly string[] {
  const risks: string[] = [];
  if (summary.isOverBudget) {
    risks.push(`Budget exceeded by ${Math.abs(summary.variance)} units.`);
  }
  const unpaidBooked = summary.totalActual - summary.totalPaid;
  if (unpaidBooked > summary.totalBudget * 0.5) {
    risks.push('High concentration of unpaid commitments (>50% of budget).');
  }
  for (const alloc of summary.categoryAllocations) {
    if (alloc.percentage > 45 && alloc.category !== 'venue') {
      risks.push(`Unusual allocation: ${alloc.category} accounts for ${alloc.percentage}% of budget.`);
    }
  }
  return Object.freeze(risks);
}
