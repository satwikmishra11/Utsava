import { BudgetCategory, EventType, BudgetItem } from '../schemas';

export const DEFAULT_BUDGET_PERCENTAGES: Record<EventType, Record<BudgetCategory, number>> = {
  wedding: {
    venue: 35,
    catering: 25,
    photography: 12,
    decor: 10,
    entertainment: 8,
    attire: 5,
    logistics: 3,
    miscellaneous: 2,
  },
  birthday: {
    venue: 20,
    catering: 35,
    entertainment: 15,
    decor: 15,
    photography: 5,
    attire: 0,
    logistics: 5,
    miscellaneous: 5,
  },
  community: {
    venue: 25,
    catering: 20,
    entertainment: 20,
    logistics: 15,
    decor: 10,
    photography: 5,
    attire: 0,
    miscellaneous: 5,
  },
};

export function allocateBudget(
  eventType: EventType,
  totalBudget: number
): Record<BudgetCategory, number> {
  const splits = DEFAULT_BUDGET_PERCENTAGES[eventType];
  const allocations = {} as Record<BudgetCategory, number>;

  for (const [cat, pct] of Object.entries(splits) as [BudgetCategory, number][]) {
    allocations[cat] = Math.round(((totalBudget * pct) / 100) * 100) / 100;
  }

  return allocations;
}

export function rebalanceBudget(
  current: Record<BudgetCategory, number>,
  changedCategory: BudgetCategory,
  newAmount: number,
  totalBudget: number
): Record<BudgetCategory, number> {
  const boundedNewAmount = Math.max(0, Math.min(newAmount, totalBudget));
  const remaining = totalBudget - boundedNewAmount;
  const categories = Object.keys(current) as BudgetCategory[];
  const otherCats = categories.filter((c) => c !== changedCategory);
  const otherTotal = otherCats.reduce((sum, c) => sum + (current[c] ?? 0), 0);

  const rebalanced = { ...current, [changedCategory]: boundedNewAmount };
  for (const cat of otherCats) {
    if (otherTotal > 0) {
      const proportion = (current[cat] ?? 0) / otherTotal;
      rebalanced[cat] = Math.round(remaining * proportion * 100) / 100;
    } else {
      rebalanced[cat] = Math.round((remaining / otherCats.length) * 100) / 100;
    }
  }

  return rebalanced;
}

export interface OverspendAnalysis {
  readonly isOverspent: boolean;
  readonly totalSpent: number;
  readonly variance: number;
  readonly overspentPercentage: number;
  readonly categoryTotals: Record<BudgetCategory, number>;
}

export function detectOverspend(
  totalBudget: number,
  items: readonly BudgetItem[]
): OverspendAnalysis {
  const categoryTotals = {} as Record<BudgetCategory, number>;
  let totalSpent = 0;

  for (const item of items) {
    const cost = item.actual > 0 ? item.actual : item.estimated;
    totalSpent += cost;
    categoryTotals[item.category] = (categoryTotals[item.category] ?? 0) + cost;
  }

  const roundedTotal = Math.round(totalSpent * 100) / 100;
  const variance = Math.round((totalBudget - roundedTotal) * 100) / 100;
  const isOverspent = roundedTotal > totalBudget;
  const overspentPercentage =
    totalBudget > 0 ? Math.round(((roundedTotal - totalBudget) / totalBudget) * 1000) / 10 : 0;

  return {
    isOverspent,
    totalSpent: roundedTotal,
    variance,
    overspentPercentage: Math.max(0, overspentPercentage),
    categoryTotals,
  };
}
