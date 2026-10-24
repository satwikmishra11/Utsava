import { NextRequest, NextResponse } from 'next/server';
import { CreateEventSchema, ListEventsQuerySchema, Event } from '@/domain/schemas';
import { requireAuth, enforceCsrf, jsonValidationError } from '../helpers';
import { getEventRepository } from '@/services/repositories';

export async function GET(req: NextRequest): Promise<Response> {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const queryParams = Object.fromEntries(req.nextUrl.searchParams);
  const parsedQuery = ListEventsQuerySchema.safeParse(queryParams);
  if (!parsedQuery.success) {
    return jsonValidationError(parsedQuery.error.flatten());
  }

  const repo = getEventRepository();
  const allUserEvents = await repo.listEvents(auth.user.id);
  const filtered = parsedQuery.data.type
    ? allUserEvents.filter((e) => e.type === parsedQuery.data.type)
    : allUserEvents;

  const startIndex = (parsedQuery.data.page - 1) * parsedQuery.data.limit;
  const events = filtered.slice(startIndex, startIndex + parsedQuery.data.limit);

  return NextResponse.json({ events, total: filtered.length }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<Response> {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const csrfErr = enforceCsrf(req);
  if (csrfErr) return csrfErr;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = CreateEventSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.flatten());
  }

  const eventToCreate: Event = {
    ...parsed.data,
    id: parsed.data.id || crypto.randomUUID(),
    userId: auth.user.id,
    createdAt: new Date().toISOString(),
  };

  const repo = getEventRepository();
  const created = await repo.createEvent(eventToCreate);
  return NextResponse.json({ event: created }, { status: 201 });
}
