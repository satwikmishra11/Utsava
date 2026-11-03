import { BudgetItem, BudgetCategory } from '../schemas';

export type RegionalTaxPresetId = 'us_standard' | 'india_gst' | 'uk_vat' | 'custom';

export interface RegionalTaxPreset {
  readonly id: RegionalTaxPresetId;
  readonly label: string;
  readonly defaultTaxRate: number;
  readonly defaultGratuityRate: number;
}

export const REGIONAL_PRESETS: readonly RegionalTaxPreset[] = [
  {
    id: 'us_standard',
    label: 'US Standard (8.5% Tax / 18% Tip)',
    defaultTaxRate: 8.5,
    defaultGratuityRate: 18.0,
  },
  {
    id: 'india_gst',
    label: 'India GST (18% GST / 10% Service)',
    defaultTaxRate: 18.0,
    defaultGratuityRate: 10.0,
  },
  {
    id: 'uk_vat',
    label: 'UK VAT (20% VAT / 12.5% Service)',
    defaultTaxRate: 20.0,
    defaultGratuityRate: 12.5,
  },
  { id: 'custom', label: 'Custom Rates', defaultTaxRate: 10.0, defaultGratuityRate: 15.0 },
];

export const TAXABLE_CATEGORIES: ReadonlySet<BudgetCategory> = new Set([
  'venue',
  'catering',
  'decor',
  'entertainment',
  'photography',
  'logistics',
]);

export const GRATUITY_CATEGORIES: ReadonlySet<BudgetCategory> = new Set([
  'catering',
  'venue',
  'logistics',
]);

export interface TrueCostAnalysis {
  readonly netContractSubtotal: number;
  readonly taxableSubtotal: number;
  readonly serviceFeeSubtotal: number;
  readonly calculatedTaxAmount: number;
  readonly calculatedGratuityAmount: number;
  readonly totalGrossLiability: number;
  readonly hiddenFeePercentage: number;
  readonly safetyMarginAmount: number;
  readonly isDeficit: boolean;
}

function getItemCost(item: BudgetItem): number {
  return item.actual > 0 ? item.actual : item.estimated;
}

function sumCategoryCosts(
  items: readonly BudgetItem[],
  allowed: ReadonlySet<BudgetCategory>
): number {
  return items.reduce(
    (sum, item) => (allowed.has(item.category) ? sum + getItemCost(item) : sum),
    0
  );
}

export function calculateTrueCostLiability(
  totalBudget: number,
  items: readonly BudgetItem[],
  taxRatePercent: number,
  gratuityRatePercent: number
): TrueCostAnalysis {
  const netContractSubtotal = items.reduce((sum, item) => sum + getItemCost(item), 0);
  const taxableSubtotal = sumCategoryCosts(items, TAXABLE_CATEGORIES);
  const serviceFeeSubtotal = sumCategoryCosts(items, GRATUITY_CATEGORIES);

  const calculatedTaxAmount = Math.round(taxableSubtotal * (Math.max(0, taxRatePercent) / 100));
  const calculatedGratuityAmount = Math.round(
    serviceFeeSubtotal * (Math.max(0, gratuityRatePercent) / 100)
  );

  const totalGrossLiability = netContractSubtotal + calculatedTaxAmount + calculatedGratuityAmount;
  const hiddenFeePercentage =
    netContractSubtotal > 0
      ? Math.round(((totalGrossLiability - netContractSubtotal) / netContractSubtotal) * 1000) / 10
      : 0;

  const safetyMarginAmount = totalBudget - totalGrossLiability;
  const isDeficit = safetyMarginAmount < 0;

  return Object.freeze({
    netContractSubtotal,
    taxableSubtotal,
    serviceFeeSubtotal,
    calculatedTaxAmount,
    calculatedGratuityAmount,
    totalGrossLiability,
    hiddenFeePercentage,
    safetyMarginAmount,
    isDeficit,
  });
}
