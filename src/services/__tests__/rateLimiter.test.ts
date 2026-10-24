import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../rateLimiter';

describe('RateLimiter Service', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(1000, 3); // 3 requests per 1000ms
  });

  it('allows requests within limit', () => {
    const r1 = limiter.check('user-1', 100);
    const r2 = limiter.check('user-1', 200);
    const r3 = limiter.check('user-1', 300);

    expect(r1.isAllowed).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.isAllowed).toBe(true);
    expect(r2.remaining).toBe(1);
    expect(r3.isAllowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests exceeding limit', () => {
    limiter.check('user-1', 100);
    limiter.check('user-1', 200);
    limiter.check('user-1', 300);
    const blocked = limiter.check('user-1', 400);

    expect(blocked.isAllowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it('resets after window expires', () => {
    limiter.check('user-1', 100);
    limiter.check('user-1', 200);
    limiter.check('user-1', 300);

    // After 1000ms, the oldest (at 100) will slide out
    const allowedAfterWindow = limiter.check('user-1', 1150);
    expect(allowedAfterWindow.isAllowed).toBe(true);
  });

  it('isolates different client identifiers', () => {
    limiter.check('client-a', 100);
    limiter.check('client-a', 200);
    limiter.check('client-a', 300);

    const clientB = limiter.check('client-b', 350);
    expect(clientB.isAllowed).toBe(true);
    expect(clientB.remaining).toBe(2);
  });
});
