/**
 * Coordinates automated schedule creation, compressing lead times proportionally
 * and generating human-readable rationale when events must be planned on short notice.
 */

import { TaskTemplate, ScheduledTask, backScheduleTimeline } from './scheduler';

export type TimelineTaskFlag = 'compressed' | 'overdue';

export interface PlannedTask extends ScheduledTask {
  readonly flags: readonly TimelineTaskFlag[];
  readonly isCompressed?: boolean;
  readonly isOverdue?: boolean;
}

export interface PlanTimelineResult {
  readonly tasks: readonly PlannedTask[];
  readonly reasons: readonly string[];
}

export function computeDaysBetween(eventDate: string, today: string): number {
  const [ey, em, ed] = eventDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  if (!ey || !em || !ed || !ty || !tm || !td) {
    throw new Error(`Invalid date format in planTimeline: eventDate=${eventDate}, today=${today}`);
  }
  const eventTime = Date.UTC(ey, em - 1, ed);
  const todayTime = Date.UTC(ty, tm - 1, td);
  return Math.round((eventTime - todayTime) / 86400000);
}

function compressTemplates(
  templates: readonly TaskTemplate[],
  ratio: number
): { readonly compressed: readonly TaskTemplate[]; readonly affectedIds: Set<string> } {
  const affectedIds = new Set<string>();
  const compressed = templates.map((t) => {
    const newDays = Math.round(t.daysBeforeEvent * ratio);
    if (newDays < t.daysBeforeEvent) {
      affectedIds.add(t.id);
    }
    return { ...t, daysBeforeEvent: newDays };
  });
  return { compressed, affectedIds };
}

function createPlannedTask(
  task: ScheduledTask,
  affectedIds: Set<string>,
  today: string
): PlannedTask {
  const flags: TimelineTaskFlag[] = [];
  if (affectedIds.has(task.id)) {
    flags.push('compressed');
  }
  if (task.dueDate < today) {
    flags.push('overdue');
  }
  return {
    ...task,
    flags: Object.freeze(flags),
    isCompressed: flags.includes('compressed'),
    isOverdue: flags.includes('overdue'),
  };
}

function sortPlannedTasks(tasks: readonly ScheduledTask[]): readonly ScheduledTask[] {
  return [...tasks].sort((a, b) => {
    const diff = a.dueDate.localeCompare(b.dueDate);
    if (diff !== 0) return diff;
    if (b.dependsOn.includes(a.id)) return -1;
    if (a.dependsOn.includes(b.id)) return 1;
    return a.id.localeCompare(b.id);
  });
}

export function planTimeline(
  eventDate: string,
  templates: readonly TaskTemplate[],
  today: string
): PlanTimelineResult {
  const daysRemaining = computeDaysBetween(eventDate, today);
  const maxLead = Math.max(...templates.map((t) => t.daysBeforeEvent), 0);
  const reasons: string[] = [];

  let activeTemplates = templates;
  let affectedIds = new Set<string>();

  if (maxLead > daysRemaining) {
    const effectiveDays = Math.max(0, daysRemaining);
    const ratio = maxLead > 0 ? effectiveDays / maxLead : 1;
    const percent = Math.round(ratio * 100);
    reasons.push(`Event is ${daysRemaining} days away: lead times compressed to ${percent}%`);
    const compressedResult = compressTemplates(templates, ratio);
    activeTemplates = compressedResult.compressed;
    affectedIds = compressedResult.affectedIds;
  }

  const scheduled = backScheduleTimeline(eventDate, activeTemplates);
  const sorted = sortPlannedTasks(scheduled);
  const tasks = sorted.map((t) => createPlannedTask(t, affectedIds, today));

  const overdueCount = tasks.filter((t) => t.flags.includes('overdue')).length;
  if (overdueCount > 0) {
    reasons.push(`${overdueCount} task(s) due before today marked as overdue`);
  }

  return {
    tasks: Object.freeze(tasks),
    reasons: Object.freeze(reasons),
  };
}
