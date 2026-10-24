import { NextRequest, NextResponse } from 'next/server';
import { GenerateTimelineRequestSchema } from '@/domain/schemas';
import { enforceRateLimit, jsonValidationError } from '../helpers';
import { buildMockTimeline } from '@/services/aiService';

export async function POST(req: NextRequest): Promise<Response> {
  const rateLimitResponse = enforceRateLimit(req);
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
