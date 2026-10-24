/**
 * In-memory sliding-window rate limiter for AI routes
 */

export interface RateLimitResult {
  readonly isAllowed: boolean;
  readonly remaining: number;
  readonly resetMs: number;
}

export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly requests: Map<string, number[]> = new Map();

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  public check(identifier: string, now: number = Date.now()): RateLimitResult {
    const timestamps = this.requests.get(identifier) ?? [];
    const windowStart = now - this.windowMs;
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0] ?? now;
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      this.requests.set(identifier, validTimestamps);
      return { isAllowed: false, remaining: 0, resetMs };
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);
    const resetMs = this.windowMs;
    return {
      isAllowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      resetMs,
    };
  }

  public reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

export const aiRateLimiter = new RateLimiter(60000, 10);
