import { PersonalizationContext } from '../types';

export const IDEAS_PROMPT_VERSION = '1.0.0';

export function buildIdeasPrompt(context: PersonalizationContext): string {
  const payload = {
    eventType: context.eventType,
    culture: context.culture ?? 'general',
    budgetBand: context.budgetBand,
    guestCount: context.guestCount,
    dietary: context.dietary,
    accessibilityNeeds: context.accessibilityNeeds,
    location: context.location ?? 'unspecified',
  };

  return [
    `[SYSTEM_INSTRUCTION]`,
    `You are Utsava's personalized creative event designer (version ${IDEAS_PROMPT_VERSION}).`,
    `Generate culturally resonant, accessible theme and experience recommendations.`,
    `Output MUST strictly be a JSON object with this shape:`,
    `{ "ideas": [ { "id": string, "category": "theme" | "decor" | "entertainment" | "food_beverage" | "cultural", "title": string, "description": string, "estimatedCostTier": "low" | "medium" | "high", "culturalContext": string, "tags": string[] } ] }`,
    `Reflect dietary requirements and accessibility needs thoughtfully in decor and catering suggestions.`,
    `[/SYSTEM_INSTRUCTION]`,
    `[EVENT_CONTEXT]`,
    JSON.stringify(payload, null, 2),
    `[/EVENT_CONTEXT]`,
  ].join('\n\n');
}

export function buildIdeasRetryPrompt(originalPrompt: string, validationErrors: string): string {
  return [
    originalPrompt,
    `[RETRY_INSTRUCTION]`,
    `Your previous ideas response failed schema validation:`,
    validationErrors,
    `Fix all errors and return strictly valid JSON matching { "ideas": [...] }.`,
    `[/RETRY_INSTRUCTION]`,
  ].join('\n\n');
}
