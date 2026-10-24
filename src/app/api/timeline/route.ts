import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateTimelineRequestSchema } from '@/domain/schemas';
import { enforceRateLimit, enforceCsrf, jsonValidationError } from '../helpers';
import { getSessionUser } from '@/services/auth/session';
import { buildMockTimeline } from '@/services/aiService';

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

  const parsed = GenerateTimelineRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.flatten());
  }

  const items = buildMockTimeline(parsed.data.eventType, parsed.data.eventStartTime);
  return NextResponse.json({ timelineItems: items }, { status: 200 });
}
