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
