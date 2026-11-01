/**
 * Pure assertion and comparison helpers for the live smoke verification suite.
 */

export const OLD_CANNED_CHAT_REPLY =
  'I can assist you with that! I will adjust the catering budget accordingly.';

export const SMOKE_CHAT_WEDDING_MSG =
  'Plan a detailed schedule and catering requirements for a 300-guest Delhi wedding.';

export const SMOKE_CHAT_BIRTHDAY_MSG =
  'Suggest an entertainment and snack schedule for a 25-kid safari birthday party in Pune.';

export interface AssertionResult {
  readonly ok: boolean;
  readonly reason?: string;
}

export interface SmokeStepResult {
  readonly endpoint: string;
  readonly status: 'PASS' | 'FAIL';
  readonly provider: string;
  readonly source: string;
  readonly latencyMs: number;
  readonly details: string;
}

export interface StepConfig {
  readonly endpoint: string;
  readonly name: string;
  readonly comparator: (a: unknown, b: unknown) => AssertionResult;
}

/**
 * Factory helper for structured smoke step results.
 */
export function makeSmokeResult(
  endpoint: string,
  status: 'PASS' | 'FAIL',
  provider: string,
  source: string,
  latencyMs: number,
  details: string
): SmokeStepResult {
  return { endpoint, status, provider, source, latencyMs, details };
}

export const SMOKE_WEDDING_CONTEXT = {
  eventType: 'wedding',
  guestCount: 300,
  location: 'Delhi',
  culture: 'Traditional Hindu Vedic rituals (Haldi, Mehendi, Sangeet, Phere, Reception)',
  totalBudget: 2500000,
  currency: 'INR',
  dietary: ['Pure Vegetarian', 'Jain'],
  accessibilityNeeds: ['Step-free ramp access for elderly guests'],
};

export const SMOKE_BIRTHDAY_CONTEXT = {
  eventType: 'birthday',
  guestCount: 25,
  location: 'Pune',
  culture: 'Wild safari animals adventure with face painting and scavenger hunt',
  totalBudget: 45000,
  currency: 'INR',
  dietary: ['Nut-free', 'Dairy-free'],
  accessibilityNeeds: ['Sensory quiet zone'],
};

export const SMOKE_WEDDING_PLAN = {
  id: 'w-smoke',
  title: 'Delhi Vedic Wedding',
  eventType: 'wedding',
  date: '2026-11-20',
  guestCount: 300,
  totalBudget: 2500000,
  currency: 'INR',
  budgetItems: [],
  timelineItems: [],
  vendors: [],
  ideas: [],
};

export const SMOKE_BIRTHDAY_PLAN = {
  id: 'b-smoke',
  title: 'Pune Safari Birthday',
  eventType: 'birthday',
  date: '2026-12-05',
  guestCount: 25,
  totalBudget: 45000,
  currency: 'INR',
  budgetItems: [],
  timelineItems: [],
  vendors: [],
  ideas: [],
};

/**
 * Validates that generation provenance was genuine live LLM intelligence,
 * rejecting rule-based fallback executions.
 */
export function assertValidAiSource(source: string | undefined): AssertionResult {
  if (!source) {
    return { ok: false, reason: 'Missing meta.source in response payload' };
  }
  if (source === 'fallback') {
    return { ok: false, reason: 'Disallowed fallback source (AI unavailable)' };
  }
  if (source !== 'llm' && source !== 'retry') {
    return { ok: false, reason: `Unexpected provenance source: "${source}"` };
  }
  return { ok: true };
}

/**
 * Asserts that the chat assistant response is not the legacy canned stub.
 */
export function assertChatNotCanned(reply: string): AssertionResult {
  const trimmed = reply.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'Chat response is empty' };
  }
  if (trimmed.includes(OLD_CANNED_CHAT_REPLY)) {
    return { ok: false, reason: 'Chat response returned legacy canned stub' };
  }
  return { ok: true };
}

/**
 * Compares two lists of named items (ideas, timeline tasks, vendors) to ensure
 * different event contexts produced substantially distinct outputs.
 */
export function compareItemTitles(
  itemsA: readonly { title?: string; name?: string }[],
  itemsB: readonly { title?: string; name?: string }[],
  entityName: string
): AssertionResult {
  if (itemsA.length === 0 || itemsB.length === 0) {
    return { ok: false, reason: `Empty ${entityName} list in one or both contexts` };
  }

  const titlesA = new Set(itemsA.map((i) => (i.title ?? i.name ?? '').toLowerCase().trim()));
  const titlesB = new Set(itemsB.map((i) => (i.title ?? i.name ?? '').toLowerCase().trim()));

  titlesA.delete('');
  titlesB.delete('');

  let common = 0;
  for (const t of titlesA) {
    if (titlesB.has(t)) common++;
  }

  const overlapRatio = common / Math.min(titlesA.size, titlesB.size);
  if (overlapRatio > 0.7) {
    return {
      ok: false,
      reason: `${entityName} overlap too high (${Math.round(overlapRatio * 100)}% identical)`,
    };
  }

  return { ok: true };
}

/**
 * Compares budget allocations between contexts to ensure financial metrics reflect event scope.
 */
export function compareBudgetAllocations(
  budgetA: readonly { category: string; estimated: number }[],
  budgetB: readonly { category: string; estimated: number }[]
): AssertionResult {
  if (budgetA.length === 0 || budgetB.length === 0) {
    return { ok: false, reason: 'Empty budget allocations in one or both contexts' };
  }

  const sumA = budgetA.reduce((acc, i) => acc + i.estimated, 0);
  const sumB = budgetB.reduce((acc, i) => acc + i.estimated, 0);

  if (sumA === sumB && sumA > 0) {
    return { ok: false, reason: 'Identical total budget across contrasting event scales' };
  }

  return { ok: true };
}

/**
 * Compares two chat replies to ensure distinct responses were generated for contrasting contexts.
 */
export function compareChatReplies(replyA: string, replyB: string): AssertionResult {
  const checkA = assertChatNotCanned(replyA);
  if (!checkA.ok) return checkA;

  const checkB = assertChatNotCanned(replyB);
  if (!checkB.ok) return checkB;

  const normA = replyA.trim().toLowerCase();
  const normB = replyB.trim().toLowerCase();

  if (normA === normB) {
    return { ok: false, reason: 'Identical chat responses generated for contrasting contexts' };
  }

  return { ok: true };
}

function pad(str: string, len: number): string {
  return str.padEnd(len).slice(0, len);
}

/**
 * Formats a terminal pass/fail summary table for smoke execution results.
 */
export function formatSmokeSummaryTable(results: readonly SmokeStepResult[]): string {
  const header = `| ${pad('Endpoint', 14)} | ${pad('Status', 6)} | ${pad('Provider', 10)} | ${pad('Source', 10)} | ${pad('Latency', 9)} | ${pad('Details', 32)} |`;
  const sep = `|${'-'.repeat(16)}|${'-'.repeat(8)}|${'-'.repeat(12)}|${'-'.repeat(12)}|${'-'.repeat(11)}|${'-'.repeat(34)}|`;

  const rows = results.map(
    (r) =>
      `| ${pad(r.endpoint, 14)} | ${pad(r.status, 6)} | ${pad(r.provider, 10)} | ${pad(r.source, 10)} | ${pad(`${r.latencyMs}ms`, 9)} | ${pad(r.details, 32)} |`
  );

  return [sep, header, sep, ...rows, sep].join('\n');
}

export const SMOKE_STEPS: readonly StepConfig[] = [
  {
    endpoint: 'ideas',
    name: 'ideas',
    comparator: (a, b) =>
      compareItemTitles(
        (a as { ideas?: { title: string }[] }).ideas ?? [],
        (b as { ideas?: { title: string }[] }).ideas ?? [],
        'Ideas'
      ),
  },
  {
    endpoint: 'timeline',
    name: 'timeline tasks',
    comparator: (a, b) =>
      compareItemTitles(
        (a as { tasks?: { title: string }[] }).tasks ?? [],
        (b as { tasks?: { title: string }[] }).tasks ?? [],
        'Timeline tasks'
      ),
  },
  {
    endpoint: 'vendors',
    name: 'vendors',
    comparator: (a, b) =>
      compareItemTitles(
        (a as { vendors?: { name: string }[] }).vendors ?? [],
        (b as { vendors?: { name: string }[] }).vendors ?? [],
        'Vendors'
      ),
  },
  {
    endpoint: 'budget',
    name: 'budget models',
    comparator: (a, b) =>
      compareBudgetAllocations(
        (a as { items?: { category: string; estimated: number }[] }).items ?? [],
        (b as { items?: { category: string; estimated: number }[] }).items ?? []
      ),
  },
];
