import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiter } from '@/services/rateLimiter';

export function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return req.headers.get('x-real-ip') ?? 'anonymous-client';
}

export function enforceRateLimit(req: NextRequest): NextResponse | null {
  const identifier = getClientIdentifier(req);
  const result = aiRateLimiter.check(identifier);

  if (!result.isAllowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait before generating again.',
        resetMs: result.resetMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(result.resetMs / 1000).toString(),
        },
      }
    );
  }

  return null;
}

export function jsonValidationError(details: unknown): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details,
    },
    { status: 400 }
  );
}
