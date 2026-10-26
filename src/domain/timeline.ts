import { TimelineItem, TimelinePhase } from './types';

export function timeStringToMinutes(time: string): number {
  const parts = time.split(':');
  const hours = Number(parts[0] ?? '0');
  const minutes = Number(parts[1] ?? '0');
  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const hStr = hours.toString().padStart(2, '0');
  const mStr = mins.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

export function sortTimelineChronologically(
  items: readonly TimelineItem[]
): readonly TimelineItem[] {
  return [...items].sort((a, b) => timeStringToMinutes(a.time) - timeStringToMinutes(b.time));
}

export function findTimelineConflicts(
  items: readonly TimelineItem[]
): readonly { readonly itemA: TimelineItem; readonly itemB: TimelineItem }[] {
  const sorted = sortTimelineChronologically(items);
  const conflicts: { itemA: TimelineItem; itemB: TimelineItem }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (!current || !next) continue;

    const currentStart = timeStringToMinutes(current.time);
    const currentEnd = currentStart + current.durationMinutes;
    const nextStart = timeStringToMinutes(next.time);

    if (currentEnd > nextStart) {
      conflicts.push({ itemA: current, itemB: next });
    }
  }

  return Object.freeze(conflicts);
}

export function toggleTimelineCompletion(
  items: readonly TimelineItem[],
  id: string
): readonly TimelineItem[] {
  return items.map((item) =>
    item.id === id ? Object.freeze({ ...item, completed: !item.completed }) : item
  );
}

export function addTimelineItem(
  items: readonly TimelineItem[],
  item: TimelineItem
): readonly TimelineItem[] {
  const next = [...items, Object.freeze({ ...item })];
  return sortTimelineChronologically(next);
}

export function filterTimelineByPhase(
  items: readonly TimelineItem[],
  phase: TimelinePhase
): readonly TimelineItem[] {
  return items.filter((item) => item.phase === phase);
}
