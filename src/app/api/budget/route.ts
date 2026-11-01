import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateBudgetRequestSchema, GenerateBudgetRequest } from '@/domain/schemas';
import { enforceRateLimit, enforceCsrf, enforceFieldLength, jsonValidationError } from '../helpers';
import { getSessionUser } from '@/services/auth/session';
import { generateBudgetPlan, PersonalizationContext } from '@/services/ai';

export const maxDuration = 60;

const QuerySchema = z.object({}).strict();

function toBudgetContext(data: GenerateBudgetRequest): PersonalizationContext {
  return {
    eventType: data.eventType,
    guestCount: data.guestCount,
    totalBudget: data.totalBudget,
    currency: data.currency,
    culture: data.culture ?? data.culturalContext,
    dietary: data.dietary,
    accessibilityNeeds: data.accessibilityNeeds,
    eventDate: data.eventDate,
    location: data.location,
    budgetBand: data.budgetTier,
  };
}

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

  const parsed = GenerateBudgetRequestSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.flatten());

  const result = await generateBudgetPlan(toBudgetContext(parsed.data));

  return NextResponse.json(
    {
      items: result.data.items,
      totalAllocated: result.data.totalAllocated,
      currency: result.data.currency,
      meta: {
        provider: result.provider ?? 'mock',
        source: result.source,
      },
    },
    { status: 200 }
  );
}
