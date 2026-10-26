import { PersonalizationContext } from '../types';
import { DEFAULT_FALLBACK_BUDGET, RUSH_PLANNING_DAYS_THRESHOLD } from '@/lib/constants';
import { computeDaysUntilEvent } from '../fallbacks';

export const BUDGET_PROMPT_VERSION = '1.1.0';

export function buildBudgetPrompt(context: PersonalizationContext): string {
  const total = context.totalBudget ?? DEFAULT_FALLBACK_BUDGET;
  const daysUntilEvent = computeDaysUntilEvent(context.eventDate);
  const perGuestCost = context.guestCount > 0 ? Math.round(total / context.guestCount) : 0;

  const payload = {
    eventType: context.eventType,
    culture: context.culture ?? 'general',
    budgetBand: context.budgetBand,
    totalBudget: total,
    currency: context.currency ?? 'INR',
    guestCount: context.guestCount,
    dietary: context.dietary,
    accessibilityNeeds: context.accessibilityNeeds,
    location: context.location ?? 'unspecified',
    daysUntilEvent,
    perGuestCost,
    hasDietaryRequirements: (context.dietary ?? []).length >= 2,
    hasAccessibilityNeeds: (context.accessibilityNeeds ?? []).length > 0,
    isRushPlanning: daysUntilEvent !== undefined && daysUntilEvent < RUSH_PLANNING_DAYS_THRESHOLD,
  };

  return [
    `[SYSTEM_INSTRUCTION]`,
    `You are Utsava's expert event budget allocation AI (version ${BUDGET_PROMPT_VERSION}).`,
    `Generate a realistic, comprehensive budget allocation for the event described in EVENT_CONTEXT.`,
    `Output MUST strictly be a JSON object with this shape:`,
    `{ "items": [ { "category": string, "estimated": number, "notes": string } ], "totalAllocated": number, "currency": string }`,
    `Allowed categories: venue, catering, photography, decor, entertainment, attire, logistics, miscellaneous.`,
    `Ensure the sum of estimated amounts equals or is within the total budget.`,
    `[/SYSTEM_INSTRUCTION]`,
    `[EVENT_CONTEXT]`,
    JSON.stringify(payload, null, 2),
    `[/EVENT_CONTEXT]`,
  ].join('\n\n');
}

export function buildBudgetRetryPrompt(originalPrompt: string, validationErrors: string): string {
  return [
    originalPrompt,
    `[RETRY_INSTRUCTION]`,
    `Your previous response failed JSON schema validation with the following errors:`,
    validationErrors,
    `Please fix the schema violations and return strictly valid JSON matching the requested format.`,
    `[/RETRY_INSTRUCTION]`,
  ].join('\n\n');
}
