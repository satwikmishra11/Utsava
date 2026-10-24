import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as chatRoute } from '../chat/route';
import { POST as ideasRoute } from '../ideas/route';
import { POST as timelineRoute } from '../timeline/route';
import { aiRateLimiter } from '@/services/rateLimiter';
import { signSession } from '@/services/auth/session';

describe('AI Endpoints Security, Rate Limiting & Input Capping Suite', () => {
  beforeEach(() => {
    aiRateLimiter.reset();
  });

  it('rejects chat messages exceeding 2000 characters with 400 Bad Request', async () => {
    const hugeMessage = 'A'.repeat(2001);
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
      },
      body: JSON.stringify({
        message: hugeMessage,
        eventPlan: {
          id: 'evt-1',
          title: 'Wedding',
          eventType: 'wedding',
          date: '2026-11-20',
          guestCount: 100,
          totalBudget: 20000,
          currency: 'USD',
          budgetItems: [],
          timelineItems: [],
          vendors: [],
          ideas: [],
        },
      }),
    });

    const res = await chatRoute(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('maximum allowed length');
  });

  it('rejects ideas requests with cultural context exceeding 500 characters', async () => {
    const req = new NextRequest('http://localhost:3000/api/ideas', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
      },
      body: JSON.stringify({
        eventType: 'wedding',
        guestCount: 100,
        culturalContext: 'X'.repeat(501),
      }),
    });

    const res = await ideasRoute(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('maximum allowed length');
  });

  it('enforces rate limits per client IP and user on AI endpoints returning 429', async () => {
    const user = { id: 'usr_rate_limited', email: 'ratelimit@example.com', name: 'Rate Tester' };
    const token = await signSession(user);

    const makeRequest = () =>
      new NextRequest('http://localhost:3000/api/timeline', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          eventType: 'wedding',
          guestCount: 100,
          eventStartTime: '15:00',
        }),
      });

    // Exhaust quota (limit is 10 requests per minute)
    let lastStatus = 200;
    for (let i = 0; i < 12; i++) {
      const res = await timelineRoute(makeRequest());
      lastStatus = res.status;
      if (res.status === 429) {
        expect(res.headers.get('Retry-After')).toBeDefined();
        break;
      }
    }
    expect(lastStatus).toBe(429);
  });

  it('enforces CSRF validation on all AI endpoints, rejecting untrusted origins with 403', async () => {
    const req = new NextRequest('http://localhost:3000/api/ideas', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://malicious-site.com',
        host: 'localhost:3000',
      },
      body: JSON.stringify({
        eventType: 'wedding',
        guestCount: 100,
      }),
    });

    const res = await ideasRoute(req);
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('CSRF');
  });

  it('rejects unexpected query string parameters on AI endpoints with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/timeline?unexpected_param=malicious', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
      },
      body: JSON.stringify({
        eventType: 'wedding',
        guestCount: 100,
      }),
    });

    const res = await timelineRoute(req);
    expect(res.status).toBe(400);
  });
});
