import { PersonalizationContext } from '../types';

export const VENDOR_PROMPT_VERSION = '1.0.0';

export function buildVendorPrompt(context: PersonalizationContext): string {
  const payload = {
    eventType: context.eventType,
    culture: context.culture ?? 'general',
    budgetBand: context.budgetBand,
    guestCount: context.guestCount,
    dietary: context.dietary,
    accessibilityNeeds: context.accessibilityNeeds,
    currency: context.currency ?? 'INR',
  };

  return [
    `[SYSTEM_INSTRUCTION]`,
    `You are Utsava's vendor checklist curator (version ${VENDOR_PROMPT_VERSION}).`,
    `Generate recommended vendor checklist items for the event described in EVENT_CONTEXT.`,
    `Output MUST strictly be a JSON object with this shape:`,
    `{ "vendors": [ { "category": string, "name": string, "role": string, "deliverables": string[], "estimatedQuote": number, "recommendedLeadWeeks": number, "priority": "critical" | "high" | "medium" } ] }`,
    `Allowed categories: venue, catering, photography, decor, entertainment, attire, logistics, miscellaneous.`,
    `[/SYSTEM_INSTRUCTION]`,
    `[EVENT_CONTEXT]`,
    JSON.stringify(payload, null, 2),
    `[/EVENT_CONTEXT]`,
  ].join('\n\n');
}

export function buildVendorRetryPrompt(originalPrompt: string, validationErrors: string): string {
  return [
    originalPrompt,
    `[RETRY_INSTRUCTION]`,
    `Your previous vendor checklist failed schema validation:`,
    validationErrors,
    `Fix all errors and return strictly valid JSON matching { "vendors": [...] }.`,
    `[/RETRY_INSTRUCTION]`,
  ].join('\n\n');
}
