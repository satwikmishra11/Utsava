import { describe, it, expect } from 'vitest';
import { calculateTrueCostLiability, REGIONAL_PRESETS } from '../budget/taxAndGratuity';
import { BudgetItem } from '../schemas';

const SAMPLE_BUDGET_ITEMS: readonly BudgetItem[] = [
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
    category: 'catering',
    estimated: 15000,
    actual: 15000,
  },
  {
    id: 'b-3',
    eventId: 'evt-1',
    category: 'photography',
    estimated: 5000,
    actual: 5000,
  },
  {
    id: 'b-4',
    eventId: 'evt-1',
    category: 'attire',
    estimated: 2000,
    actual: 2000,
  },
];

describe('Tax, Gratuity & True Cost Liability Forecaster Domain Logic', () => {
  it('correctly calculates taxes, service gratuities, and hidden fee impact', () => {
    // Total budget: 45000
    // Net contracts subtotal = 10000 + 15000 + 5000 + 2000 = 32000
    // Taxable categories: venue (10000) + catering (15000) + photo (5000) = 30000 (attire is not in TAXABLE_CATEGORIES)
    // Gratuity categories: venue (10000) + catering (15000) = 25000
    // Tax rate: 10% -> 3000
    // Gratuity rate: 15% -> 3750
    // Total gross liability: 32000 + 3000 + 3750 = 38750
    // Safety margin: 45000 - 38750 = 6250 (not deficit)
    const analysis = calculateTrueCostLiability(45000, SAMPLE_BUDGET_ITEMS, 10, 15);

    expect(analysis.netContractSubtotal).toBe(32000);
    expect(analysis.taxableSubtotal).toBe(30000);
    expect(analysis.serviceFeeSubtotal).toBe(25000);
    expect(analysis.calculatedTaxAmount).toBe(3000);
    expect(analysis.calculatedGratuityAmount).toBe(3750);
    expect(analysis.totalGrossLiability).toBe(38750);
    expect(analysis.safetyMarginAmount).toBe(6250);
    expect(analysis.isDeficit).toBe(false);
    expect(analysis.hiddenFeePercentage).toBe(21.1);
  });

  it('detects budget deficit when gross liability exceeds total budget ceiling', () => {
    // Total budget: 35000 vs gross liability 38750 -> deficit of -3750
    const analysis = calculateTrueCostLiability(35000, SAMPLE_BUDGET_ITEMS, 10, 15);

    expect(analysis.isDeficit).toBe(true);
    expect(analysis.safetyMarginAmount).toBe(-3750);
  });

  it('includes complete regional presets with valid default rates', () => {
    expect(REGIONAL_PRESETS.length).toBeGreaterThanOrEqual(4);
    const us = REGIONAL_PRESETS.find((p) => p.id === 'us_standard');
    expect(us?.defaultTaxRate).toBe(8.5);
    expect(us?.defaultGratuityRate).toBe(18.0);

    const india = REGIONAL_PRESETS.find((p) => p.id === 'india_gst');
    expect(india?.defaultTaxRate).toBe(18.0);
    expect(india?.defaultGratuityRate).toBe(10.0);
  });

  it('handles empty item list safely', () => {
    const analysis = calculateTrueCostLiability(20000, [], 10, 10);
    expect(analysis.netContractSubtotal).toBe(0);
    expect(analysis.totalGrossLiability).toBe(0);
    expect(analysis.hiddenFeePercentage).toBe(0);
    expect(analysis.safetyMarginAmount).toBe(20000);
    expect(analysis.isDeficit).toBe(false);
  });
});
