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

export function detectCycles(tasks: readonly TaskTemplate[]): readonly string[] | null {
  const adj = new Map<string, string[]>();
  for (const t of tasks) adj.set(t.id, [...t.dependsOn]);

  const state = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  const cyclePath: string[] = [];

  function dfs(curr: string): boolean {
    state.set(curr, 1);
    cyclePath.push(curr);
    for (const neighbor of adj.get(curr) ?? []) {
      if (state.get(neighbor) === 1) {
        cyclePath.push(neighbor);
        return true;
      }
      if (state.get(neighbor) !== 2 && dfs(neighbor)) return true;
    }
    state.set(curr, 2);
    cyclePath.pop();
    return false;
  }

  for (const t of tasks) {
    if (!state.get(t.id) && dfs(t.id)) return Object.freeze(cyclePath);
  }
  return null;
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
