import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as chatHandler } from '../chat/route';
import { POST as ideasHandler } from '../ideas/route';
import { POST as timelineHandler } from '../timeline/route';
import { aiRateLimiter } from '@/services/rateLimiter';

describe('API Route Handlers (Integration)', () => {
  beforeEach(() => {
    aiRateLimiter.reset();
  });

  const validPlan = {
    id: 'evt-test',
    title: 'Community Summer Festival',
    eventType: 'community',
    date: '2026-08-20',
    guestCount: 300,
    totalBudget: 15000,
    currency: 'USD',
    budgetItems: [],
    timelineItems: [],
    vendors: [],
    ideas: [],
  };

  it('rejects chat request with invalid schema (400)', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: '' }), // Missing eventPlan, invalid empty message
    });
    const res = await chatHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation failed');
  });

  it('streams response for valid chat request', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Can we add a sound system to the budget?',
        eventPlan: validPlan,
        chatHistory: [],
      }),
    });
    const res = await chatHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it('enforces rate limiting on repeated requests', async () => {
    for (let i = 0; i < 10; i++) {
      const req = new NextRequest('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.100' },
        body: JSON.stringify({
          eventType: 'birthday',
          guestCount: 50,
          budgetTier: 'moderate',
        }),
      });
      await ideasHandler(req);
    }

    const blockedReq = new NextRequest('http://localhost:3000/api/ideas', {
      method: 'POST',
      headers: { 'x-forwarded-for': '192.168.1.100' },
      body: JSON.stringify({
        eventType: 'birthday',
        guestCount: 50,
        budgetTier: 'moderate',
      }),
    });
    const blockedRes = await ideasHandler(blockedReq);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('retry-after')).toBeDefined();
  });

  it('generates timeline items with valid request', async () => {
    const req = new NextRequest('http://localhost:3000/api/timeline', {
      method: 'POST',
      body: JSON.stringify({
        eventType: 'wedding',
        eventStartTime: '15:00',
        durationHours: 6,
      }),
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.timelineItems).toBeDefined();
    expect(json.timelineItems.length).toBeGreaterThan(0);
  });
});
