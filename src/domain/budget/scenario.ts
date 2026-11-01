/**
 * Sensitivity analysis and scenario modeling for event budgets,
 * separating fixed overhead from variable per-guest expenses to provide
 * predictive financial stress-testing and capacity planning.
 */

import { BudgetItem, BudgetCategory } from '../schemas';

export interface BudgetScenario {
  readonly label: string;
  readonly guestCount: number;
  readonly projectedCost: number;
  readonly variance: number;
  readonly perGuestCost: number;
  readonly status: 'comfortable' | 'tight' | 'over_budget';
}

export interface SensitivityAnalysisResult {
  readonly baseGuestCount: number;
  readonly totalBudget: number;
  readonly fixedCostTotal: number;
  readonly variableCostTotal: number;
  readonly marginalPerGuestCost: number;
  readonly fixedCostRatio: number;
  readonly variableCostRatio: number;
  readonly maxAffordableGuests: number;
  readonly scenarios: readonly BudgetScenario[];
}

export function isVariableCategory(category: BudgetCategory): boolean {
  return category === 'catering' || category === 'miscellaneous';
}

export function calculateFixedAndVariableCosts(items: readonly BudgetItem[]): {
  readonly fixedTotal: number;
  readonly variableTotal: number;
} {
  let fixedTotal = 0;
  let variableTotal = 0;

  for (const item of items) {
    const cost = item.actual > 0 ? item.actual : item.estimated;
    if (isVariableCategory(item.category)) {
      variableTotal += cost;
    } else {
      fixedTotal += cost;
    }
  }

  return {
    fixedTotal: Math.round(fixedTotal * 100) / 100,
    variableTotal: Math.round(variableTotal * 100) / 100,
  };
}

export function calculateMarginalPerGuestCost(
  variableTotal: number,
  baseGuestCount: number
): number {
  const safeGuests = Math.max(1, baseGuestCount);
  return Math.round((variableTotal / safeGuests) * 100) / 100;
}

export function calculateMaxAffordableGuests(
  totalBudget: number,
  fixedTotal: number,
  marginalCost: number
): number {
  if (marginalCost <= 0) return 9999;
  const availableForVariable = Math.max(0, totalBudget - fixedTotal);
  return Math.floor(availableForVariable / marginalCost);
}

function resolveScenarioStatus(
  projectedCost: number,
  totalBudget: number
): 'comfortable' | 'tight' | 'over_budget' {
  if (projectedCost > totalBudget) return 'over_budget';
  const remaining = totalBudget - projectedCost;
  return remaining < totalBudget * 0.08 ? 'tight' : 'comfortable';
}

export function buildScenario(
  label: string,
  guestCount: number,
  fixedTotal: number,
  marginalCost: number,
  totalBudget: number
): BudgetScenario {
  const safeGuests = Math.max(1, guestCount);
  const projectedCost = Math.round((fixedTotal + safeGuests * marginalCost) * 100) / 100;
  const variance = Math.round((totalBudget - projectedCost) * 100) / 100;
  const perGuestCost = Math.round((projectedCost / safeGuests) * 100) / 100;

  return {
    label,
    guestCount: safeGuests,
    projectedCost,
    variance,
    perGuestCost,
    status: resolveScenarioStatus(projectedCost, totalBudget),
  };
}

export function calculateSensitivityAnalysis(
  totalBudget: number,
  baseGuestCount: number,
  items: readonly BudgetItem[]
): SensitivityAnalysisResult {
  const safeGuests = Math.max(1, baseGuestCount);
  const { fixedTotal, variableTotal } = calculateFixedAndVariableCosts(items);
  const marginalCost = calculateMarginalPerGuestCost(variableTotal, safeGuests);
  const totalSpend = fixedTotal + variableTotal;
  const fixedRatio = totalSpend > 0 ? Math.round((fixedTotal / totalSpend) * 100) : 0;
  const variableRatio = totalSpend > 0 ? Math.round((variableTotal / totalSpend) * 100) : 0;

  const scenarios: readonly BudgetScenario[] = [
    buildScenario(
      'Intimate (-25%)',
      Math.round(safeGuests * 0.75),
      fixedTotal,
      marginalCost,
      totalBudget
    ),
    buildScenario('Baseline (Current)', safeGuests, fixedTotal, marginalCost, totalBudget),
    buildScenario(
      'Expanded (+25%)',
      Math.round(safeGuests * 1.25),
      fixedTotal,
      marginalCost,
      totalBudget
    ),
  ];

  return {
    baseGuestCount: safeGuests,
    totalBudget,
    fixedCostTotal: fixedTotal,
    variableCostTotal: variableTotal,
    marginalPerGuestCost: marginalCost,
    fixedCostRatio: fixedRatio,
    variableCostRatio: variableRatio,
    maxAffordableGuests: calculateMaxAffordableGuests(totalBudget, fixedTotal, marginalCost),
    scenarios,
  };
}
