import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateIdeasRequestSchema } from '@/domain/schemas';
import { enforceRateLimit, enforceCsrf, enforceFieldLength, jsonValidationError } from '../helpers';
import { getSessionUser } from '@/services/auth/session';
import { generateIdeas } from '@/services/ai';

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

  const lenErr = enforceFieldLength(body, 'culturalContext', 500);
  if (lenErr) return lenErr;

  const parsed = GenerateIdeasRequestSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.flatten());

  const result = await generateIdeas({
    eventType: parsed.data.eventType,
    guestCount: parsed.data.guestCount,
    budgetBand: parsed.data.budgetTier,
    culture: parsed.data.culturalContext,
    dietary: [],
    accessibilityNeeds: [],
  });
  return NextResponse.json({ ideas: result.data.ideas }, { status: 200 });
}
