/**
 * Immutable temporal operations for converting, sorting, and sequencing milestone
 * times without mutating existing schedule state or causing timezone drifts.
 */

import { TimelineItem, TimelinePhase } from '../types';

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

export interface RunOfShowMetrics {
  readonly totalDurationMinutes: number;
  readonly completedCount: number;
  readonly totalCount: number;
  readonly completionPercentage: number;
  readonly formattedTotalRuntime: string;
}

export function calculateRunOfShowMetrics(items: readonly TimelineItem[]): RunOfShowMetrics {
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const totalDurationMinutes = items.reduce((sum, i) => sum + (i.durationMinutes || 0), 0);
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;
  const formattedTotalRuntime = `${hours}h ${mins}m`;

  return {
    totalDurationMinutes,
    completedCount,
    totalCount,
    completionPercentage,
    formattedTotalRuntime,
  };
}
