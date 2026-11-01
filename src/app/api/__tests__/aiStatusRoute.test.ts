import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as statusHandler } from '../ai/status/route';
import { aiRateLimiter } from '@/services/rateLimiter';

describe('GET /api/ai/status', () => {
  beforeEach(() => {
    aiRateLimiter.reset();
  });

  const defaultHeaders = {
    origin: 'http://localhost:3000',
    host: 'localhost:3000',
  };

  it('returns 200 with provider information and live status', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/status', {
      method: 'GET',
      headers: defaultHeaders,
    });

    const res = await statusHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('provider');
    expect(data).toHaveProperty('live');
    expect(typeof data.live).toBe('boolean');
    // Ensure no secret keys are exposed
    const stringified = JSON.stringify(data);
    expect(stringified).not.toContain('secret');
    expect(stringified).not.toContain('key');
  });

  it('enforces rate limiting on repeated status requests', async () => {
    for (let i = 0; i < 10; i++) {
      const req = new NextRequest('http://localhost:3000/api/ai/status', {
        method: 'GET',
        headers: { ...defaultHeaders, 'x-forwarded-for': '10.0.0.99' },
      });
      await statusHandler(req);
    }

    const blockedReq = new NextRequest('http://localhost:3000/api/ai/status', {
      method: 'GET',
      headers: { ...defaultHeaders, 'x-forwarded-for': '10.0.0.99' },
    });
    const blockedRes = await statusHandler(blockedReq);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('retry-after')).toBeDefined();
  });
});
