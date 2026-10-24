import { NextResponse, NextRequest } from 'next/server';
import { validateCsrf } from '@/services/auth/csrf';

export function middleware(req: NextRequest): NextResponse {
  // Enforce CSRF on state-changing API mutations
  if (req.nextUrl.pathname.startsWith('/api/') && !validateCsrf(req)) {
    return NextResponse.json(
      { error: 'Forbidden: CSRF check failed. Invalid or missing Origin/Referer header.' },
      { status: 403 }
    );
  }

  const response = NextResponse.next();

  // Apply strict security headers on all dynamic responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
