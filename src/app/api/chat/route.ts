import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ChatRequestSchema } from '@/domain/schemas';
import { enforceRateLimit, enforceCsrf, enforceInputLength, jsonValidationError } from '../helpers';
import { getSessionUser } from '@/services/auth/session';
import { chatWithPlanAssistant } from '@/services/aiService';

const QuerySchema = z.object({}).strict();

export async function POST(req: NextRequest): Promise<Response> {
  const queryParsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!queryParsed.success) {
    return jsonValidationError(queryParsed.error.flatten());
  }

  const csrfErr = enforceCsrf(req);
  if (csrfErr) return csrfErr;

  const sessionUser = await getSessionUser(req);
  const rateLimitResponse = enforceRateLimit(req, sessionUser?.id);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.flatten());
  }

  const lengthErr = enforceInputLength(parsed.data.message, 2000);
  if (lengthErr) return lengthErr;

  const stream = await chatWithPlanAssistant(
    parsed.data.message,
    parsed.data.eventPlan,
    parsed.data.chatHistory
  );

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
