import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimiter } from '@/services/rateLimiter';
import { getSessionUser, SessionUser } from '@/services/auth/session';
import { validateCsrf } from '@/services/auth/csrf';

function getClientIdentifier(req: NextRequest, userId?: string): string {
  if (userId) return `user_${userId}`;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return `ip_${firstIp}`;
  }
  return `ip_${req.headers.get('x-real-ip') ?? 'anonymous'}`;
}

export function enforceRateLimit(req: NextRequest, userId?: string): NextResponse | null {
  const identifier = getClientIdentifier(req, userId);
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

export function enforceCsrf(req: NextRequest): NextResponse | null {
  if (!validateCsrf(req)) {
    return NextResponse.json(
      { error: 'CSRF validation failed: Missing or invalid Origin / Referer.' },
      { status: 403 }
    );
  }
  return null;
}

export async function requireAuth(req: NextRequest): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
  }
  return { user };
}

export function enforceFieldLength(
  body: unknown,
  field: string,
  maxLen: number
): NextResponse | null {
  if (typeof body === 'object' && body !== null && field in body) {
    const val = (body as Record<string, unknown>)[field];
    if (typeof val === 'string' && val.length > maxLen) {
      return NextResponse.json(
        { error: `Input exceeds maximum allowed length of ${maxLen} characters.` },
        { status: 400 }
      );
    }
  }
  return null;
}

export function jsonValidationError(details: unknown): NextResponse {
  return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
}

export function jsonForbidden(error: string = 'Access denied'): NextResponse {
  return NextResponse.json({ error }, { status: 403 });
}

export function jsonNotFound(error: string = 'Resource not found'): NextResponse {
  return NextResponse.json({ error }, { status: 404 });
}
