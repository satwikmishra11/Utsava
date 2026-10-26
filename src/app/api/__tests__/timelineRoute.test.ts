import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as timelineHandler } from '../timeline/route';
import { aiRateLimiter } from '@/services/rateLimiter';
import * as capabilities from '@/services/ai/capabilities';

describe('POST /api/timeline Route Handler', () => {
  beforeEach(() => {
    aiRateLimiter.reset();
    vi.restoreAllMocks();
  });

  const defaultHeaders = {
    'content-type': 'application/json',
    origin: 'http://localhost:3000',
    host: 'localhost:3000',
  };

  const createReq = (
    body: unknown,
    headers: Record<string, string> = defaultHeaders,
    search = ''
  ) => {
    return new NextRequest(`http://localhost:3000/api/timeline${search}`, {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  };

  it('generates timeline items in demo mode with no API key', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = createReq({
      eventType: 'wedding',
      eventStartTime: '14:00',
      durationHours: 8,
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { timelineItems: unknown[]; tasks: unknown[] };
    expect(Array.isArray(json.timelineItems)).toBe(true);
    expect(json.timelineItems.length).toBeGreaterThan(0);
    expect(Array.isArray(json.tasks)).toBe(true);
  });

  it('passes context such as culture, guestCount and eventDate to generateTimeline', async () => {
    const spy = vi.spyOn(capabilities, 'generateTimeline');
    const req = createReq({
      eventType: 'birthday',
      guestCount: 50,
      culture: 'Gujarati',
      eventDate: '2026-11-20',
      location: 'Ahmedabad',
      dietary: ['Jain vegetarian'],
      accessibilityNeeds: ['Step-free access'],
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);
    const calledContext = spy.mock.calls[0]?.[0];
    expect(calledContext?.eventType).toBe('birthday');
    expect(calledContext?.guestCount).toBe(50);
    expect(calledContext?.culture).toBe('Gujarati');
    expect(calledContext?.eventDate).toBe('2026-11-20');
  });

  it('falls back to culturalContext or keyTraditions when culture is not directly provided', async () => {
    const spy = vi.spyOn(capabilities, 'generateTimeline');
    const req = createReq({
      eventType: 'community',
      culturalContext: 'Diwali Festival',
      keyTraditions: ['Diya Lighting', 'Rangoli'],
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(200);
    const calledContext = spy.mock.calls[0]?.[0];
    expect(calledContext?.culture).toBe('Diwali Festival');
  });

  it('maps generated tasks to timelineItems preserving required shape', async () => {
    const req = createReq({
      eventType: 'wedding',
      eventStartTime: '11:00',
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      timelineItems: Array<{
        id: string;
        phase: string;
        title: string;
        time: string;
        durationMinutes: number;
        completed: boolean;
      }>;
    };
    const firstItem = json.timelineItems[0];
    expect(firstItem?.id).toBeDefined();
    expect(firstItem?.phase).toBe('preparation');
    expect(firstItem?.title).toBeDefined();
    expect(firstItem?.time).toBeDefined();
    expect(firstItem?.durationMinutes).toBe(60);
    expect(firstItem?.completed).toBe(false);
  });

  it('rejects invalid JSON payload with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/timeline', {
      method: 'POST',
      headers: defaultHeaders,
      body: 'invalid-not-json{',
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('Invalid JSON payload');
  });

  it('rejects invalid eventType with 400', async () => {
    const req = createReq({
      eventType: 'non_existent_type',
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('Validation failed');
  });

  it('rejects invalid eventStartTime with 400', async () => {
    const req = createReq({
      eventType: 'wedding',
      eventStartTime: '25:99',
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(400);
  });

  it('rejects culturalContext longer than 500 characters with 400', async () => {
    const req = createReq({
      eventType: 'wedding',
      culturalContext: 'A'.repeat(501),
    });
    const res = await timelineHandler(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toContain('maximum allowed length');
  });

  it('rejects unexpected query parameters with 400', async () => {
    const req = createReq({ eventType: 'wedding' }, defaultHeaders, '?extra=true');
    const res = await timelineHandler(req);
    expect(res.status).toBe(400);
  });

  it('rejects request with missing CSRF headers with 403', async () => {
    const req = createReq({ eventType: 'wedding' }, { 'content-type': 'application/json' });
    const res = await timelineHandler(req);
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error: string };
    expect(json.error).toContain('CSRF');
  });

  it('enforces rate limits per client IP returning 429', async () => {
    const ipHeaders = { ...defaultHeaders, 'x-forwarded-for': '10.0.0.99' };
    for (let i = 0; i < 10; i++) {
      const req = createReq({ eventType: 'wedding' }, ipHeaders);
      await timelineHandler(req);
    }
    const blockedReq = createReq({ eventType: 'wedding' }, ipHeaders);
    const res = await timelineHandler(blockedReq);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeDefined();
  });
});
