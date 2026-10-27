import { z } from 'zod';
import { BudgetCategory, EventTypeSchema } from '../schemas';
import { DEFAULT_BUDGET_PERCENTAGES } from './overspend';
import {
  PER_GUEST_BUDGET_RANGES_INR,
  GUEST_COUNT_THRESHOLDS,
  RUSH_PLANNING_DAYS_THRESHOLD,
} from '@/lib/constants';

export const BudgetAdvisorInputSchema = z.object({
  eventType: EventTypeSchema,
  totalBudget: z.number().nonnegative(),
  currency: z.string().min(1).max(5),
  guestCount: z.number().int().positive(),
  dietary: z.array(z.string().max(60)).readonly().optional().default([]),
  accessibilityNeeds: z.array(z.string().max(100)).readonly().optional().default([]),
  culture: z.string().optional(),
  daysUntilEvent: z.number().int().optional(),
});

export type BudgetAdvisorInput = z.input<typeof BudgetAdvisorInputSchema>;
export type BudgetAdvisorParsedInput = z.output<typeof BudgetAdvisorInputSchema>;

export interface BudgetAdvisorResult {
  readonly percentages: Record<BudgetCategory, number>;
  readonly reasons: readonly string[];
}

function applyPerGuestRule(
  percentages: Record<BudgetCategory, number>,
  reasons: string[],
  input: BudgetAdvisorParsedInput
): void {
  if (input.currency.toUpperCase() !== 'INR' || input.guestCount <= 0) return;
  const perGuest = input.totalBudget / input.guestCount;
  const range = PER_GUEST_BUDGET_RANGES_INR[input.eventType];
  if (!range) return;

  if (perGuest < range.min) {
    percentages.catering += 4;
    percentages.decor -= 2;
    percentages.entertainment -= 2;
    reasons.push(
      `Per-guest budget below reference range (₹${Math.round(perGuest)}): +4% catering.`
    );
  } else if (perGuest > range.max) {
    percentages.decor += 2;
    percentages.photography += 1;
    percentages.catering -= 3;
    reasons.push(
      `Per-guest budget exceeds reference range (₹${Math.round(perGuest)}): +3% decor/photo.`
    );
  }
}

function applyGuestCountRule(
  percentages: Record<BudgetCategory, number>,
  reasons: string[],
  input: BudgetAdvisorParsedInput
): void {
  if (input.guestCount >= GUEST_COUNT_THRESHOLDS.LARGE) {
    percentages.logistics += 2;
    percentages.catering += 2;
    percentages.decor -= 4;
    reasons.push(`Large guest list (${input.guestCount}): +2% logistics, +2% catering from decor.`);
  } else if (input.guestCount <= GUEST_COUNT_THRESHOLDS.INTIMATE) {
    percentages.venue += 2;
    percentages.decor += 1;
    percentages.logistics -= 3;
    reasons.push(`Intimate guest list (${input.guestCount}): +2% venue, +1% decor from logistics.`);
  }
}

function applySpecialRequirements(
  percentages: Record<BudgetCategory, number>,
  reasons: string[],
  input: BudgetAdvisorParsedInput
): void {
  const dietary = input.dietary ?? [];
  if (dietary.length >= 2) {
    percentages.catering += 2;
    reasons.push(`Multiple dietary requirements (${dietary.length}): +2% catering.`);
  }

  const accessibility = input.accessibilityNeeds ?? [];
  if (accessibility.length > 0) {
    percentages.logistics += 3;
    reasons.push(`Accessibility accommodations: +3% logistics.`);
  }

  if (input.daysUntilEvent !== undefined && input.daysUntilEvent < RUSH_PLANNING_DAYS_THRESHOLD) {
    percentages.miscellaneous += 3;
    reasons.push(
      `Short planning window (${input.daysUntilEvent}d): +3% miscellaneous contingency.`
    );
  }
}

function adjustRoundingDifference(
  normalized: Record<BudgetCategory, number>,
  categories: readonly BudgetCategory[],
  runningSum: number
): void {
  const diff = 100 - runningSum;
  const firstCat = categories[0];
  if (diff === 0 || !firstCat) return;

  let maxCat: BudgetCategory = firstCat;
  for (const cat of categories) {
    if ((normalized[cat] ?? 0) > (normalized[maxCat] ?? 0)) {
      maxCat = cat;
    }
  }
  normalized[maxCat] = (normalized[maxCat] ?? 0) + diff;
}

function normalizePercentages(raw: Record<BudgetCategory, number>): Record<BudgetCategory, number> {
  const categories = Object.keys(raw) as BudgetCategory[];
  const clamped = {} as Record<BudgetCategory, number>;
  for (const cat of categories) {
    clamped[cat] = Math.max(0, raw[cat]);
  }
  const sum = categories.reduce((acc, cat) => acc + clamped[cat], 0);
  if (sum === 0) return { ...raw };

  const normalized = {} as Record<BudgetCategory, number>;
  let runningSum = 0;
  for (const cat of categories) {
    normalized[cat] = Math.round((clamped[cat] / sum) * 100);
    runningSum += normalized[cat];
  }

  adjustRoundingDifference(normalized, categories, runningSum);
  return normalized;
}

export function adviseBudgetSplit(rawInput: BudgetAdvisorInput): BudgetAdvisorResult {
  const input = BudgetAdvisorInputSchema.parse(rawInput);
  const baseSplits = DEFAULT_BUDGET_PERCENTAGES[input.eventType];
  const percentages: Record<BudgetCategory, number> = { ...baseSplits };
  const reasons: string[] = [];

  applyPerGuestRule(percentages, reasons, input);
  applyGuestCountRule(percentages, reasons, input);
  applySpecialRequirements(percentages, reasons, input);

  return {
    percentages: normalizePercentages(percentages),
    reasons: Object.freeze(reasons),
  };
}
