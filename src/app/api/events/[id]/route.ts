import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UpdateEventSchema } from '@/domain/schemas';
import {
  requireAuth,
  enforceCsrf,
  jsonValidationError,
  jsonForbidden,
  jsonNotFound,
} from '../../helpers';
import { getEventRepository } from '@/services/repositories';

const ParamSchema = z.object({ id: z.string().min(1).max(100) });

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext): Promise<Response> {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rawParams = await context.params;
  const parsedParams = ParamSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return jsonValidationError(parsedParams.error.flatten());
  }

  const repo = getEventRepository();
  const event = await repo.getEventById(parsedParams.data.id);
  if (!event) return jsonNotFound('Event not found');

  if (event.userId !== auth.user.id) {
    return jsonForbidden('Access denied: You do not own this event');
  }

  return NextResponse.json({ event }, { status: 200 });
}

export async function PUT(req: NextRequest, context: RouteContext): Promise<Response> {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const csrfErr = enforceCsrf(req);
  if (csrfErr) return csrfErr;

  const rawParams = await context.params;
  const parsedParams = ParamSchema.safeParse(rawParams);
  if (!parsedParams.success) return jsonValidationError(parsedParams.error.flatten());

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsedBody = UpdateEventSchema.safeParse(body);
  if (!parsedBody.success) return jsonValidationError(parsedBody.error.flatten());

  const repo = getEventRepository();
  const existing = await repo.getEventById(parsedParams.data.id);
  if (!existing) return jsonNotFound('Event not found');
  if (existing.userId !== auth.user.id) {
    return jsonForbidden('Access denied: You do not own this event');
  }

  const updated = await repo.updateEvent(parsedParams.data.id, parsedBody.data, auth.user.id);
  return NextResponse.json({ event: updated }, { status: 200 });
}

export async function DELETE(req: NextRequest, context: RouteContext): Promise<Response> {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const csrfErr = enforceCsrf(req);
  if (csrfErr) return csrfErr;

  const rawParams = await context.params;
  const parsedParams = ParamSchema.safeParse(rawParams);
  if (!parsedParams.success) return jsonValidationError(parsedParams.error.flatten());

  const repo = getEventRepository();
  const existing = await repo.getEventById(parsedParams.data.id);
  if (!existing) return jsonNotFound('Event not found');
  if (existing.userId !== auth.user.id) {
    return jsonForbidden('Access denied: You do not own this event');
  }

  await repo.deleteEvent(parsedParams.data.id, auth.user.id);
  return NextResponse.json({ success: true }, { status: 200 });
}
