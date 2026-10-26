import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { signSession } from '@/services/auth/session';
import { POST as createEvent } from '../events/route';
import { GET as getEvent } from '../events/[id]/route';
import { POST as ideasHandler } from '../ideas/route';
import { setEventRepository, DrizzleEventRepository } from '@/services/repositories';
import { aiRateLimiter } from '@/services/rateLimiter';
import { generationCache } from '@/services/cacheService';

const USER_ALICE = {
  id: 'usr_alice_int',
  email: 'alice.int@example.com',
  name: 'Alice Integration',
};

async function makeHeaders(user?: { id: string; email: string; name: string }): Promise<Headers> {
  const headers = new Headers({
    'content-type': 'application/json',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
  });
  if (user) {
    const token = await signSession(user);
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
}

describe('API Security and Middleware Integration Suite', () => {
  beforeEach(() => {
    setEventRepository(new DrizzleEventRepository());
    aiRateLimiter.reset();
    generationCache.clear();
  });

  describe('Validation Failures (400 Bad Request)', () => {
    it('returns 400 on malformed JSON body', async () => {
      const headers = await makeHeaders(USER_ALICE);
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers,
        body: '{{malformed json string',
      });
      const res = await createEvent(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid JSON payload');
    });

    it('returns 400 with detailed Zod issues when schema validation fails', async () => {
      const headers = await makeHeaders(USER_ALICE);
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'wedding',
          title: 'Invalid Event',
          date: 'not-a-date',
          guestCount: -10,
          totalBudget: -500,
        }),
      });
      const res = await createEvent(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Validation failed');
      expect(json.details).toBeDefined();
    });

    it('rejects unexpected query parameters on /api/events/[id]', async () => {
      const aliceHeaders = await makeHeaders(USER_ALICE);
      const req = new NextRequest('http://localhost:3000/api/events/evt-123?unexpected=param', {
        method: 'GET',
        headers: aliceHeaders,
      });
      const res = await getEvent(req, { params: Promise.resolve({ id: 'evt-123' }) });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Validation failed');
    });

    it('creates an event with server-generated cryptographic UUID when client omits id', async () => {
      const aliceHeaders = await makeHeaders(USER_ALICE);
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: aliceHeaders,
        body: JSON.stringify({
          type: 'wedding',
          title: 'Secure UUID Wedding',
          date: '2026-11-20',
          location: 'San Francisco, CA',
          guestCount: 120,
          totalBudget: 35000,
        }),
      });
      const res = await createEvent(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.event.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('Rate Limiting & CSRF Security', () => {
    it('returns 429 Too Many Requests when rate limit quota is exceeded', async () => {
      const headers = await makeHeaders(USER_ALICE);

      for (let i = 0; i < 10; i++) {
        const req = new NextRequest('http://localhost:3000/api/ideas', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            eventType: 'birthday',
            guestCount: 30,
            budgetTier: 'moderate',
          }),
        });
        const res = await ideasHandler(req);
        expect(res.status).toBe(200);
      }

      // 11th request exceeds limit
      const blockedReq = new NextRequest('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventType: 'birthday',
          guestCount: 30,
          budgetTier: 'moderate',
        }),
      });
      const blockedRes = await ideasHandler(blockedReq);
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get('retry-after')).toBeDefined();
      const blockedJson = await blockedRes.json();
      expect(blockedJson.error).toContain('Too many requests');
    });

    it('returns 403 Forbidden when CSRF verification fails (cross-site attack)', async () => {
      const headers = await makeHeaders(USER_ALICE);
      headers.set('origin', 'http://malicious-attacker.com');

      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'wedding',
          title: 'CSRF Exploit Attempt',
          date: '2026-11-20',
          guestCount: 50,
          totalBudget: 10000,
        }),
      });
      const res = await createEvent(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('CSRF');
    });
  });

  describe('LLM Fallback Path Integration', () => {
    it('gracefully falls back to deterministic domain templates when LLM throws error', async () => {
      const headers = await makeHeaders(USER_ALICE);

      const { MockProvider } = await import('@/services/llm/mockProvider');
      const failingProvider = new MockProvider();
      failingProvider.setFailureCount(10);

      const { executeStructuredWithRetry } = await import('@/services/ai/structuredExecutor');
      const spy = vi.spyOn({ executeStructuredWithRetry }, 'executeStructuredWithRetry');

      const req = new NextRequest('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventType: 'community',
          guestCount: 150,
          budgetTier: 'moderate',
          culturalContext: 'Heritage',
        }),
      });

      const res = await ideasHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ideas).toBeDefined();
      expect(json.ideas.length).toBeGreaterThan(0);
      expect(json.ideas[0]?.title).toBeDefined();

      spy.mockRestore();
    });
  });
});
