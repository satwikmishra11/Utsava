/**
 * Live Smoke Verification Suite
 *
 * Validates a live local or deployed Utsava instance against genuine LLM generation.
 * Usage: BASE_URL=https://utsava-wheat.vercel.app npm run smoke:live
 */

import {
  SmokeStepResult,
  AssertionResult,
  assertValidAiSource,
  compareChatReplies,
  formatSmokeSummaryTable,
  makeSmokeResult,
  SMOKE_WEDDING_CONTEXT,
  SMOKE_BIRTHDAY_CONTEXT,
  SMOKE_WEDDING_PLAN,
  SMOKE_BIRTHDAY_PLAN,
  SMOKE_CHAT_WEDDING_MSG,
  SMOKE_CHAT_BIRTHDAY_MSG,
  SMOKE_STEPS,
} from './smokeAssertions';

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const PACING_DELAY_MS = 2500;
const RATE_LIMIT_RETRY_DELAY_MS = 6000;

interface JsonWithMeta {
  readonly meta?: {
    readonly provider?: string;
    readonly source?: string;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithPacing(url: string, init: RequestInit): Promise<Response> {
  await sleep(PACING_DELAY_MS);
  let res = await fetch(url, init);

  if (res.status === 429) {
    const retryAfter = res.headers.get('retry-after');
    const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : RATE_LIMIT_RETRY_DELAY_MS;
    process.stdout.write(`  [HTTP 429] Rate limit hit. Backing off for ${delay}ms...\n`);
    await sleep(delay);
    res = await fetch(url, init);
  }

  return res;
}

function createHeaders(sessionCookie: string): Record<string, string> {
  const origin = new URL(BASE_URL).origin;
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': 'smoke-test-token',
    Origin: origin,
    Referer: origin,
    Cookie: sessionCookie,
  };
}

async function establishSession(baseUrl: string): Promise<string> {
  const origin = new URL(baseUrl).origin;
  const res = await fetch(`${baseUrl}/api/auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Origin: origin,
      Referer: origin,
    },
    body: JSON.stringify({
      id: 'smoke-test-user',
      email: 'smoke-test@utsava.local',
      name: 'Smoke Test Suite',
    }),
  });

  if (!res.ok) throw new Error(`Failed to establish session: HTTP ${res.status}`);
  const setCookie = res.headers.get('set-cookie');
  return setCookie ? setCookie.split(';')[0] || '' : '';
}

async function checkAiStatus(baseUrl: string): Promise<SmokeStepResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${baseUrl}/api/ai/status`);
    const latency = Date.now() - start;
    if (!res.ok)
      return makeSmokeResult(
        '/api/ai/status',
        'FAIL',
        'unknown',
        'none',
        latency,
        `HTTP ${res.status}`
      );
    const json = (await res.json()) as { live?: boolean; provider?: string };
    if (!json.live) {
      return makeSmokeResult(
        '/api/ai/status',
        'FAIL',
        json.provider || 'mock',
        'mock',
        latency,
        'Demo mode (live: false)'
      );
    }
    return makeSmokeResult(
      '/api/ai/status',
      'PASS',
      json.provider || 'gemini',
      'live',
      latency,
      `Live active (${json.provider})`
    );
  } catch (err) {
    const latency = Date.now() - start;
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return makeSmokeResult('/api/ai/status', 'FAIL', 'unknown', 'none', latency, msg);
  }
}

function checkAssertionError(metaSource?: string, compResult?: AssertionResult): string | null {
  const srcCheck = assertValidAiSource(metaSource);
  if (!srcCheck.ok) return srcCheck.reason ?? 'Invalid source';
  if (compResult && !compResult.ok) return compResult.reason ?? 'Overlap failure';
  return null;
}

function evaluateStructured<T extends JsonWithMeta>(
  jsonA: T,
  jsonB: T,
  endpoint: string,
  comparator: (a: T, b: T) => AssertionResult,
  entityName: string,
  latencyMs: number
): SmokeStepResult {
  const provider = jsonA.meta?.provider ?? 'unknown';
  const source = jsonA.meta?.source ?? 'unknown';
  const errReason = checkAssertionError(jsonA.meta?.source, comparator(jsonA, jsonB));

  if (errReason) {
    return makeSmokeResult(`/api/${endpoint}`, 'FAIL', provider, source, latencyMs, errReason);
  }
  return makeSmokeResult(
    `/api/${endpoint}`,
    'PASS',
    provider,
    source,
    latencyMs,
    `Distinct ${entityName} verified`
  );
}

async function postJson(
  baseUrl: string,
  path: string,
  headers: Record<string, string>,
  body: unknown
): Promise<Response> {
  return fetchWithPacing(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

async function testStructuredEndpoint<T extends JsonWithMeta>(
  baseUrl: string,
  endpoint: string,
  cookie: string,
  comparator: (a: T, b: T) => AssertionResult,
  entityName: string
): Promise<SmokeStepResult> {
  const start = Date.now();
  const headers = createHeaders(cookie);

  const resA = await postJson(baseUrl, `/api/${endpoint}`, headers, SMOKE_WEDDING_CONTEXT);
  const resB = await postJson(baseUrl, `/api/${endpoint}`, headers, SMOKE_BIRTHDAY_CONTEXT);

  const latency = Date.now() - start;
  if (!resA.ok || !resB.ok) {
    const details = `HTTP error (A: ${resA.status}, B: ${resB.status})`;
    return makeSmokeResult(`/api/${endpoint}`, 'FAIL', 'unknown', 'none', latency, details);
  }

  const [jsonA, jsonB] = (await Promise.all([resA.json(), resB.json()])) as [T, T];
  return evaluateStructured(jsonA, jsonB, endpoint, comparator, entityName, latency);
}

function makeChatPayload(message: string, eventPlan: object) {
  return { message, eventPlan, chatHistory: [] };
}

function evaluateChat(
  provider: string,
  replyA: string,
  replyB: string,
  latency: number
): SmokeStepResult {
  const comp = compareChatReplies(replyA, replyB);
  if (!comp.ok) {
    return makeSmokeResult(
      '/api/chat',
      'FAIL',
      provider,
      'llm',
      latency,
      comp.reason ?? 'Canned reply'
    );
  }
  return makeSmokeResult(
    '/api/chat',
    'PASS',
    provider,
    'llm',
    latency,
    'Non-canned contrasting replies verified'
  );
}

async function testChatEndpoint(baseUrl: string, cookie: string): Promise<SmokeStepResult> {
  const start = Date.now();
  const headers = createHeaders(cookie);

  const resA = await postJson(
    baseUrl,
    '/api/chat',
    headers,
    makeChatPayload(SMOKE_CHAT_WEDDING_MSG, SMOKE_WEDDING_PLAN)
  );
  const resB = await postJson(
    baseUrl,
    '/api/chat',
    headers,
    makeChatPayload(SMOKE_CHAT_BIRTHDAY_MSG, SMOKE_BIRTHDAY_PLAN)
  );

  const latency = Date.now() - start;
  if (!resA.ok || !resB.ok) {
    return makeSmokeResult(
      '/api/chat',
      'FAIL',
      'unknown',
      'none',
      latency,
      `HTTP error (A: ${resA.status}, B: ${resB.status})`
    );
  }

  const [replyA, replyB] = await Promise.all([resA.text(), resB.text()]);
  const provider = resA.headers.get('x-ai-provider') || 'gemini';
  return evaluateChat(provider, replyA, replyB, latency);
}

function reportAndExit(results: readonly SmokeStepResult[]): void {
  process.stdout.write(`\n${formatSmokeSummaryTable(results)}\n\n`);
  if (results.some((r) => r.status === 'FAIL')) {
    process.stderr.write('❌ Smoke verification failed. Inspect table above for details.\n\n');
    process.exit(1);
  }
  process.stdout.write('✅ All live AI smoke verification checks passed successfully!\n\n');
}

async function runLiveSmoke(): Promise<void> {
  process.stdout.write(`\n🚀 Starting Utsava Live Smoke Suite targeting: ${BASE_URL}\n\n`);

  const results: SmokeStepResult[] = [];
  const statusResult = await checkAiStatus(BASE_URL);
  results.push(statusResult);

  if (statusResult.status !== 'PASS') {
    process.stderr.write(`❌ Live AI check failed: ${statusResult.details}\n\n`);
    reportAndExit(results);
    return;
  }

  process.stdout.write(`✓ AI Status: ${statusResult.details}\n`);
  process.stdout.write('  Establishing authenticated session...\n');
  const cookie = await establishSession(BASE_URL);

  for (const step of SMOKE_STEPS) {
    process.stdout.write(`  Executing ${step.name} verification...\n`);
    results.push(
      await testStructuredEndpoint(BASE_URL, step.endpoint, cookie, step.comparator, step.name)
    );
  }

  process.stdout.write('  Executing Chat Assistant verification...\n');
  results.push(await testChatEndpoint(BASE_URL, cookie));
  reportAndExit(results);
}

runLiveSmoke().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`\n❌ Fatal error running smoke test: ${msg}\n\n`);
  process.exit(1);
});
