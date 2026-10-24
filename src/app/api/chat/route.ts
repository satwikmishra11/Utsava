import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/domain/schemas';
import { enforceRateLimit, jsonValidationError } from '../helpers';
import { chatWithPlanAssistant } from '@/services/aiService';

export async function POST(req: NextRequest): Promise<Response> {
  const rateLimitResponse = enforceRateLimit(req);
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

  const { message, eventPlan, chatHistory } = parsed.data;
  const stream = await chatWithPlanAssistant(message, eventPlan, chatHistory);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
