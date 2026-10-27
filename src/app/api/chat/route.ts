import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ChatRequestSchema } from '@/domain/schemas';
import { enforceRateLimit, enforceCsrf, enforceFieldLength, jsonValidationError } from '../helpers';
import { getSessionUser } from '@/services/auth/session';
import { executeChatAssistant } from '@/services/ai';

const QuerySchema = z.object({}).strict();

export async function POST(req: NextRequest): Promise<Response> {
  const queryParsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!queryParsed.success) return jsonValidationError(queryParsed.error.flatten());

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

  const lengthErr = enforceFieldLength(body, 'message', 2000);
  if (lengthErr) return lengthErr;

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.flatten());

  const chatResult = await executeChatAssistant({
    message: parsed.data.message,
    eventPlan: parsed.data.eventPlan,
    chatHistory: parsed.data.chatHistory,
  });

  return new Response(chatResult.stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
