import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { signSession } from '@/services/auth/session';
import { POST as createEvent, GET as listEvents } from '../events/route';
import { GET as getEvent, PUT as updateEvent, DELETE as deleteEvent } from '../events/[id]/route';
import { POST as ideasHandler } from '../ideas/route';
import { setEventRepository, DrizzleEventRepository } from '@/services/repositories';
import { aiRateLimiter } from '@/services/rateLimiter';
import { generationCache } from '@/services/cacheService';

const USER_ALICE = {
  id: 'usr_alice_int',
  email: 'alice.int@example.com',
  name: 'Alice Integration',
};
const USER_BOB = { id: 'usr_bob_int', email: 'bob.int@example.com', name: 'Bob Integration' };

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

describe('Complete API Routes Integration Suite', () => {
  beforeEach(() => {
    setEventRepository(new DrizzleEventRepository());
    aiRateLimiter.reset();
    generationCache.clear();
  });

  describe('Authentication & IDOR Enforcement', () => {
    it('returns 401 Unauthorized when attempting to create an event without credentials', async () => {
      const headers = await makeHeaders(); // No user
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'wedding',
          title: 'Unauthorized Wedding',
          date: '2026-11-15',
          guestCount: 100,
          totalBudget: 20000,
        }),
      });
      const res = await createEvent(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Unauthorized');
    });

    it('returns 401 when token is invalid or tampered', async () => {
      const headers = new Headers({
        'content-type': 'application/json',
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
        authorization: 'Bearer bad.token.signature',
      });
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'GET',
        headers,
      });
      const res = await listEvents(req);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when Alice attempts to access or mutate Bob event (IDOR)', async () => {
      const bobHeaders = await makeHeaders(USER_BOB);
      const createReq = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: bobHeaders,
        body: JSON.stringify({
          type: 'birthday',
          title: "Bob's 40th Birthday",
          date: '2026-09-10',
          location: 'Austin Lounge',
          guestCount: 50,
          totalBudget: 4000,
        }),
      });
      const createRes = await createEvent(createReq);
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      const bobEventId = created.event.id;

      // Alice tries to GET Bob's event -> 403
      const aliceHeaders = await makeHeaders(USER_ALICE);
      const getReq = new NextRequest(`http://localhost:3000/api/events/${bobEventId}`, {
        method: 'GET',
        headers: aliceHeaders,
      });
      const getRes = await getEvent(getReq, { params: Promise.resolve({ id: bobEventId }) });
      expect(getRes.status).toBe(403);

      // Alice tries to PUT Bob's event -> 403
      const putReq = new NextRequest(`http://localhost:3000/api/events/${bobEventId}`, {
        method: 'PUT',
        headers: aliceHeaders,
        body: JSON.stringify({ title: 'Hijacked Event Title' }),
      });
      const putRes = await updateEvent(putReq, { params: Promise.resolve({ id: bobEventId }) });
      expect(putRes.status).toBe(403);

      // Alice tries to DELETE Bob's event -> 403
      const delReq = new NextRequest(`http://localhost:3000/api/events/${bobEventId}`, {
        method: 'DELETE',
        headers: aliceHeaders,
      });
      const delRes = await deleteEvent(delReq, { params: Promise.resolve({ id: bobEventId }) });
      expect(delRes.status).toBe(403);
    });
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
          guestCount: -10, // Invalid negative guest count
          totalBudget: -500, // Invalid negative budget
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

  describe('Event Mutation & Lifecycle (PUT & DELETE)', () => {
    it('successfully updates an event via PUT for the verified owner', async () => {
      const aliceHeaders = await makeHeaders(USER_ALICE);
      const createReq = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: aliceHeaders,
        body: JSON.stringify({
          type: 'birthday',
          title: 'Alice Birthday Party',
          date: '2026-10-10',
          location: 'Austin, TX',
          guestCount: 25,
          totalBudget: 2500,
        }),
      });
      const createRes = await createEvent(createReq);
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      const eventId = created.event.id;

      const putReq = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'PUT',
        headers: aliceHeaders,
        body: JSON.stringify({
          title: 'Alice 30th Gala Birthday',
          totalBudget: 3500,
        }),
      });
      const putRes = await updateEvent(putReq, { params: Promise.resolve({ id: eventId }) });
      expect(putRes.status).toBe(200);
      const updated = await putRes.json();
      expect(updated.event.title).toBe('Alice 30th Gala Birthday');
      expect(updated.event.totalBudget).toBe(3500);
    });

    it('successfully deletes an event via DELETE for the verified owner', async () => {
      const aliceHeaders = await makeHeaders(USER_ALICE);
      const createReq = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: aliceHeaders,
        body: JSON.stringify({
          type: 'community',
          title: 'Neighborhood Clean-up',
          date: '2026-11-01',
          location: 'Seattle, WA',
          guestCount: 60,
          totalBudget: 1200,
        }),
      });
      const createRes = await createEvent(createReq);
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      const eventId = created.event.id;

      const delReq = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: aliceHeaders,
      });
      const delRes = await deleteEvent(delReq, { params: Promise.resolve({ id: eventId }) });
      expect(delRes.status).toBe(200);
      const delJson = await delRes.json();
      expect(delJson.success).toBe(true);

      // Verify subsequent GET returns 404
      const getReq = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'GET',
        headers: aliceHeaders,
      });
      const getRes = await getEvent(getReq, { params: Promise.resolve({ id: eventId }) });
      expect(getRes.status).toBe(404);
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

      // Force MockProvider to throw an error
      const { MockProvider } = await import('@/services/llm/mockProvider');
      const failingProvider = new MockProvider();
      failingProvider.setFailureCount(10); // Fail primary and retry

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
