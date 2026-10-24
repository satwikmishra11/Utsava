import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSessionUser,
  signSession,
  buildSessionCookieHeader,
  buildClearSessionCookieHeader,
} from '@/services/auth/session';
import { jsonValidationError } from '../../helpers';

const LoginSchema = z.object({
  id: z.string().min(1).max(100),
  email: z.string().email().max(150),
  name: z.string().min(1).max(100),
});

export async function GET(req: NextRequest): Promise<Response> {
  const user = await getSessionUser(req);
  return NextResponse.json({ user }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.flatten());
  }

  const token = await signSession(parsed.data);
  const cookieHeader = buildSessionCookieHeader(token);

  const response = NextResponse.json({ user: parsed.data, token }, { status: 200 });
  response.headers.set('Set-Cookie', cookieHeader);
  return response;
}

export async function DELETE(): Promise<Response> {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.headers.set('Set-Cookie', buildClearSessionCookieHeader());
  return response;
}
