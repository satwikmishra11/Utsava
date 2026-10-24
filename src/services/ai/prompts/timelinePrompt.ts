import { PersonalizationContext } from '../types';

export const TIMELINE_PROMPT_VERSION = '1.0.0';

export function buildTimelinePrompt(context: PersonalizationContext): string {
  const payload = {
    eventType: context.eventType,
    culture: context.culture ?? 'general',
    guestCount: context.guestCount,
    dietary: context.dietary,
    accessibilityNeeds: context.accessibilityNeeds,
    eventDate: context.eventDate ?? '2026-12-31',
  };

  return [
    `[SYSTEM_INSTRUCTION]`,
    `You are Utsava's expert event timeline coordinator (version ${TIMELINE_PROMPT_VERSION}).`,
    `Generate back-scheduled milestone tasks for the event in EVENT_CONTEXT.`,
    `Output MUST strictly be a JSON object with this shape:`,
    `{ "tasks": [ { "id": string, "title": string, "category": string, "daysBeforeEvent": number, "dependsOn": string[], "assignee": string } ] }`,
    `Ensure task dependency IDs exist within the task list and form an acyclic dependency graph.`,
    `[/SYSTEM_INSTRUCTION]`,
    `[EVENT_CONTEXT]`,
    JSON.stringify(payload, null, 2),
    `[/EVENT_CONTEXT]`,
  ].join('\n\n');
}

export function buildTimelineRetryPrompt(originalPrompt: string, validationErrors: string): string {
  return [
    originalPrompt,
    `[RETRY_INSTRUCTION]`,
    `Your previous timeline failed schema validation:`,
    validationErrors,
    `Fix all errors and return strictly valid JSON matching { "tasks": [...] } with no cyclic dependencies.`,
    `[/RETRY_INSTRUCTION]`,
  ].join('\n\n');
}
