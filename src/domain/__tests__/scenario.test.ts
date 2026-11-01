import { describe, it, expect } from 'vitest';
import {
  isVariableCategory,
  calculateFixedAndVariableCosts,
  calculateMarginalPerGuestCost,
  calculateMaxAffordableGuests,
  buildScenario,
  calculateSensitivityAnalysis,
} from '../budget/scenario';
import { BudgetItem } from '../schemas';

const MOCK_ITEMS: readonly BudgetItem[] = [
  {
    id: 'b-1',
    eventId: 'evt-1',
    category: 'venue',
    estimated: 10000,
    actual: 10000,
  },
  {
    id: 'b-2',
    eventId: 'evt-1',
    category: 'photography',
    estimated: 5000,
    actual: 0,
  },
  {
    id: 'b-3',
    eventId: 'evt-1',
    category: 'catering',
    estimated: 15000,
    actual: 15000,
  },
  {
    id: 'b-4',
    eventId: 'evt-1',
    category: 'miscellaneous',
    estimated: 2000,
    actual: 0,
  },
];

describe('Budget Sensitivity & Scenario Analysis', () => {
  it('identifies variable and fixed expense categories accurately', () => {
    expect(isVariableCategory('catering')).toBe(true);
    expect(isVariableCategory('miscellaneous')).toBe(true);
    expect(isVariableCategory('venue')).toBe(false);
    expect(isVariableCategory('photography')).toBe(false);
    expect(isVariableCategory('entertainment')).toBe(false);
  });

  it('separates fixed and variable totals from budget items', () => {
    const { fixedTotal, variableTotal } = calculateFixedAndVariableCosts(MOCK_ITEMS);
    // venue (10000) + photography (5000) = 15000
    expect(fixedTotal).toBe(15000);
    // catering (15000) + misc (2000) = 17000
    expect(variableTotal).toBe(17000);
  });

  it('calculates marginal per-guest costs safely', () => {
    const marginal = calculateMarginalPerGuestCost(17000, 100);
    expect(marginal).toBe(170);

    const safeZero = calculateMarginalPerGuestCost(17000, 0);
    expect(safeZero).toBe(17000);
  });

  it('determines max affordable guest count under budget ceiling', () => {
    const maxGuests = calculateMaxAffordableGuests(40000, 15000, 170);
    // (40000 - 15000) / 170 = 25000 / 170 = ~147.05 => 147
    expect(maxGuests).toBe(147);
  });

  it('builds individual scenario projections with status classification', () => {
    const scenario = buildScenario('Expanded (+20%)', 120, 15000, 170, 40000);
    expect(scenario.guestCount).toBe(120);
    expect(scenario.projectedCost).toBe(15000 + 120 * 170); // 35400
    expect(scenario.variance).toBe(4600);
    expect(scenario.status).toBe('comfortable');

    const overBudget = buildScenario('Excess (+100%)', 200, 15000, 170, 40000);
    expect(overBudget.projectedCost).toBe(49000);
    expect(overBudget.variance).toBe(-9000);
    expect(overBudget.status).toBe('over_budget');
  });

  it('generates full sensitivity analysis result across conservative, baseline, and expanded horizons', () => {
    const result = calculateSensitivityAnalysis(40000, 100, MOCK_ITEMS);
    expect(result.baseGuestCount).toBe(100);
    expect(result.fixedCostTotal).toBe(15000);
    expect(result.variableCostTotal).toBe(17000);
    expect(result.marginalPerGuestCost).toBe(170);
    expect(result.fixedCostRatio).toBe(47);
    expect(result.variableCostRatio).toBe(53);
    expect(result.maxAffordableGuests).toBe(147);
    expect(result.scenarios).toHaveLength(3);

    const [intimate, baseline, expanded] = result.scenarios;
    expect(intimate?.label).toBe('Intimate (-25%)');
    expect(intimate?.guestCount).toBe(75);
    expect(baseline?.label).toBe('Baseline (Current)');
    expect(baseline?.guestCount).toBe(100);
    expect(expanded?.label).toBe('Expanded (+25%)');
    expect(expanded?.guestCount).toBe(125);
  });
});
