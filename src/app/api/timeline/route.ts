import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateTimelineRequestSchema, GenerateTimelineRequest } from '@/domain/schemas';
import { TimelineItem } from '@/domain/types';
import { enforceRateLimit, enforceCsrf, enforceFieldLength, jsonValidationError } from '../helpers';
import { getSessionUser } from '@/services/auth/session';
import { generateTimeline, GeneratedTimelineTask, PersonalizationContext } from '@/services/ai';

const QuerySchema = z.object({}).strict();

function resolveCulture(data: GenerateTimelineRequest): string | undefined {
  if (data.culture) return data.culture;
  if (data.culturalContext) return data.culturalContext;
  if (data.keyTraditions.length > 0) return data.keyTraditions.join(', ');
  return undefined;
}

function toPersonalizationContext(data: GenerateTimelineRequest): PersonalizationContext {
  return {
    eventType: data.eventType,
    guestCount: data.guestCount ?? 100,
    culture: resolveCulture(data),
    eventDate: data.eventDate,
    location: data.location,
    budgetBand: data.budgetBand,
    totalBudget: data.totalBudget,
    currency: data.currency,
    dietary: data.dietary,
    accessibilityNeeds: data.accessibilityNeeds,
  };
}

function toTimelineItem(task: GeneratedTimelineTask, defaultTime: string): TimelineItem {
  return {
    id: task.id,
    phase: 'preparation',
    title: task.title,
    time: task.dueDate ?? defaultTime,
    durationMinutes: 60,
    completed: task.status === 'completed',
    notes: task.category,
    flags: task.flags,
    isCompressed: task.isCompressed,
    isOverdue: task.isOverdue,
  };
}

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

  const lenErr = enforceFieldLength(body, 'culturalContext', 500);
  if (lenErr) return lenErr;

  const parsed = GenerateTimelineRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.flatten());
  }

  const context = toPersonalizationContext(parsed.data);
  const result = await generateTimeline(context);
  const timelineItems = result.data.tasks.map((task) =>
    toTimelineItem(task, parsed.data.eventStartTime)
  );

  return NextResponse.json(
    {
      timelineItems,
      tasks: result.data.tasks,
    },
    { status: 200 }
  );
}
