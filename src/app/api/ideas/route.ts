import { NextRequest, NextResponse } from 'next/server';
import { GenerateIdeasRequestSchema } from '@/domain/schemas';
import { enforceRateLimit, jsonValidationError } from '../helpers';
import { generateIdeas } from '@/services/aiService';

export async function POST(req: NextRequest): Promise<Response> {
  const rateLimitResponse = enforceRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = GenerateIdeasRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.flatten());
  }

  const ideas = await generateIdeas(parsed.data);
  return NextResponse.json({ ideas }, { status: 200 });
}
