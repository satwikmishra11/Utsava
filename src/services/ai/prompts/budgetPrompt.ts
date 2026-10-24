import { PersonalizationContext } from '../types';

export const BUDGET_PROMPT_VERSION = '1.0.0';

export function buildBudgetPrompt(context: PersonalizationContext): string {
  const payload = {
    eventType: context.eventType,
    culture: context.culture ?? 'general',
    budgetBand: context.budgetBand,
    totalBudget: context.totalBudget ?? 10000,
    currency: context.currency ?? 'USD',
    guestCount: context.guestCount,
    dietary: context.dietary,
    accessibilityNeeds: context.accessibilityNeeds,
    location: context.location ?? 'unspecified',
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
