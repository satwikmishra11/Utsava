/**
 * Security utilities for prompt injection defense, input sanitization, and output encoding
 */

const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|guidelines|rules|prompts?)/i,
  /disregard\s+(the\s+)?(previous|system|above)\s+(prompt|instructions|guidelines|rules)/i,
  /system\s+prompt\s+override/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /\bjailbreak\b/i,
  /bypass\s+(safety|content|policy)\s+filters/i,
  /pretend\s+you\s+have\s+no\s+(rules|limits|guidelines)/i,
  /<\|(?:im_start|im_end|endoftext)\|>/i,
  /<\/?system>/i,
];

export interface InjectionCheckResult {
  readonly isSafe: boolean;
  readonly matchedPattern?: string;
}

export function detectPromptInjection(input: string): InjectionCheckResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { isSafe: false, matchedPattern: pattern.source };
    }
  }
  return { isSafe: true };
}

export function sanitizePromptInput(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .trim();
}

export function sanitizeHtmlOutput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function buildSecurePromptEnvelope(
  systemInstruction: string,
  userContent: string,
  eventContextJson: string
): string {
  const sanitizedUserContent = sanitizePromptInput(userContent);
  return [
    `[SYSTEM_INSTRUCTION]`,
    systemInstruction,
    `[/SYSTEM_INSTRUCTION]`,
    `[EVENT_CONTEXT]`,
    eventContextJson,
    `[/EVENT_CONTEXT]`,
    `[USER_INPUT]`,
    sanitizedUserContent,
    `[/USER_INPUT]`,
  ].join('\n\n');
}
