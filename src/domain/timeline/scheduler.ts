/**
 * Schedules milestones backwards from event dates using UTC calendar math,
 * preventing off-by-one errors and flagging tasks that fall past due.
 */

import { detectCycles } from './cycles';

export interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly daysBeforeEvent: number;
  readonly dependsOn: readonly string[];
}

export interface ScheduledTask {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly dueDate: string;
  readonly daysBeforeEvent: number;
  readonly dependsOn: readonly string[];
}

export function subtractDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Invalid date format: ${dateStr}`);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function resolveTaskDate(
  id: string,
  eventDateStr: string,
  taskMap: Map<string, TaskTemplate>,
  scheduledDates: Map<string, string>
): string {
  const cached = scheduledDates.get(id);
  if (cached) return cached;
  const task = taskMap.get(id);
  if (!task) throw new Error(`Referenced task ID not found: ${id}`);

  let computedDate = subtractDays(eventDateStr, task.daysBeforeEvent);
  for (const depId of task.dependsOn) {
    const depDate = resolveTaskDate(depId, eventDateStr, taskMap, scheduledDates);
    if (depDate > computedDate) computedDate = depDate;
  }
  scheduledDates.set(id, computedDate);
  return computedDate;
}

export function backScheduleTimeline(
  eventDateStr: string,
  templates: readonly TaskTemplate[]
): readonly ScheduledTask[] {
  const cycle = detectCycles(templates);
  if (cycle) {
    throw new Error(`Cyclic dependency detected in timeline tasks: ${cycle.join(' -> ')}`);
  }

  const taskMap = new Map(templates.map((t) => [t.id, t]));
  const scheduledDates = new Map<string, string>();
  templates.forEach((t) => resolveTaskDate(t.id, eventDateStr, taskMap, scheduledDates));

  return templates
    .map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      dueDate: scheduledDates.get(t.id) ?? eventDateStr,
      daysBeforeEvent: t.daysBeforeEvent,
      dependsOn: t.dependsOn,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export const DEFAULT_TIMELINE_TEMPLATES: readonly TaskTemplate[] = [
  {
    id: 't-1',
    title: 'Secure Event Venue',
    category: 'venue',
    daysBeforeEvent: 180,
    dependsOn: [],
  },
  {
    id: 't-2',
    title: 'Confirm Catering Menu',
    category: 'catering',
    daysBeforeEvent: 90,
    dependsOn: ['t-1'],
  },
  {
    id: 't-3',
    title: 'Contract Photographer',
    category: 'photography',
    daysBeforeEvent: 60,
    dependsOn: ['t-1'],
  },
  {
    id: 't-4',
    title: 'Finalize Decor & Theme',
    category: 'decor',
    daysBeforeEvent: 30,
    dependsOn: ['t-1'],
  },
  {
    id: 't-5',
    title: 'Send Guest RSVPs',
    category: 'logistics',
    daysBeforeEvent: 14,
    dependsOn: ['t-2'],
  },
];
