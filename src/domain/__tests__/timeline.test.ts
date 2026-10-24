import { describe, it, expect } from 'vitest';
import {
  timeStringToMinutes,
  minutesToTimeString,
  sortTimelineChronologically,
  findTimelineConflicts,
  toggleTimelineCompletion,
  addTimelineItem,
  filterTimelineByPhase,
} from '../timeline';
import { TimelineItem } from '../types';

describe('Timeline Domain Functions', () => {
  const sampleItems: readonly TimelineItem[] = [
    {
      id: 't-1',
      phase: 'ceremony',
      title: 'Main Ceremony',
      time: '14:00',
      durationMinutes: 90,
      completed: false,
    },
    {
      id: 't-2',
      phase: 'preparation',
      title: 'Vendor Setup & Soundcheck',
      time: '11:00',
      durationMinutes: 120,
      completed: true,
    },
    {
      id: 't-3',
      phase: 'reception',
      title: 'Dinner & Speeches',
      time: '15:00', // Note: 14:00 + 90 min = 15:30, so this conflicts with t-1
      durationMinutes: 120,
      completed: false,
    },
  ];

  it('converts time string to minutes and back accurately', () => {
    expect(timeStringToMinutes('14:30')).toBe(870);
    expect(minutesToTimeString(870)).toBe('14:30');
    expect(minutesToTimeString(0)).toBe('00:00');
  });

  it('sorts timeline chronologically', () => {
    const sorted = sortTimelineChronologically(sampleItems);
    expect(sorted[0]?.id).toBe('t-2'); // 11:00
    expect(sorted[1]?.id).toBe('t-1'); // 14:00
    expect(sorted[2]?.id).toBe('t-3'); // 15:00
  });

  it('detects scheduling conflicts accurately', () => {
    const conflicts = findTimelineConflicts(sampleItems);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.itemA.id).toBe('t-1');
    expect(conflicts[0]?.itemB.id).toBe('t-3');
  });

  it('toggles completion status immutably', () => {
    const next = toggleTimelineCompletion(sampleItems, 't-1');
    expect(next.find((i) => i.id === 't-1')?.completed).toBe(true);
    expect(sampleItems.find((i) => i.id === 't-1')?.completed).toBe(false);
  });

  it('adds item and keeps chronological order', () => {
    const newItem: TimelineItem = {
      id: 't-4',
      phase: 'ceremony',
      title: 'Guest Seating',
      time: '13:30',
      durationMinutes: 30,
      completed: false,
    };
    const next = addTimelineItem(sampleItems, newItem);
    expect(next[1]?.id).toBe('t-4'); // 11:00, then 13:30
  });

  it('filters items by phase', () => {
    const prepItems = filterTimelineByPhase(sampleItems, 'preparation');
    expect(prepItems).toHaveLength(1);
    expect(prepItems[0]?.title).toBe('Vendor Setup & Soundcheck');
  });
});
