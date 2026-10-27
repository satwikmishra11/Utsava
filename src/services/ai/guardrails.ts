/**
 * Enforces conversational topic boundaries, intercepting off-topic inquiries (code, medical, finance)
 * and prompt injection attempts before they reach the language model.
 */

import { detectPromptInjection } from '@/domain/security';

const OUT_OF_SCOPE_PATTERNS: readonly RegExp[] = [
  /\b(write|debug|fix|explain)\s+(?:a\s+|an\s+|the\s+)?(python|javascript|typescript|c\+\+|java|rust|sql|code|function|class|script|html)\b/i,
  /\b(stock|cryptocurrency|crypto|bitcoin|investing|portfolio)\b.*\b(advice|tips|picks)\b/i,
  /\b(medical|diagnosis|prescribe|symptoms|cure)\b/i,
  /\b(political\s+campaign|election|candidate|vote\s+for)\b/i,
  /\b(hack|exploit|ddos|vulnerability|malware|keylogger)\b/i,
];

export interface GuardrailCheckResult {
  readonly isAllowed: boolean;
  readonly refusalReason?: 'prompt_injection' | 'out_of_scope';
  readonly refusalMessage?: string;
}

export const POLITE_REFUSAL_MESSAGE =
  'I am Utsava, an AI assistant dedicated to event planning. I can only assist with budgets, timelines, vendors, decor, and celebration ideas. How can I help with your event?';

export function checkScopeGuardrails(input: string): GuardrailCheckResult {
  const injection = detectPromptInjection(input);
  if (!injection.isSafe) {
    return {
      isAllowed: false,
      refusalReason: 'prompt_injection',
      refusalMessage:
        'I detected an unsafe instruction or attempt to override safety constraints. Please provide an event planning question.',
    };
  }

  for (const pattern of OUT_OF_SCOPE_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isAllowed: false,
        refusalReason: 'out_of_scope',
        refusalMessage: POLITE_REFUSAL_MESSAGE,
      };
    }
  }

  return { isAllowed: true };
}
