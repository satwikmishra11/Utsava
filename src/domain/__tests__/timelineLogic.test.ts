import { describe, it, expect } from 'vitest';
import {
  subtractDays,
  detectCycles,
  backScheduleTimeline,
  planTimeline,
  computeDaysBetween,
  TaskTemplate,
  DEFAULT_TIMELINE_TEMPLATES,
} from '../timelineLogic';

describe('Timeline Logic Pure Functions', () => {
  it('accurately subtracts days across month and year boundaries', () => {
    expect(subtractDays('2026-03-01', 1)).toBe('2026-02-28');
    expect(subtractDays('2026-01-05', 10)).toBe('2025-12-26');
  });

  it('throws error for malformed date string in subtractDays', () => {
    expect(() => subtractDays('invalid-date', 5)).toThrowError(/Invalid date format/);
  });

  it('detects a direct cycle between tasks (A -> B -> A)', () => {
    const tasks: TaskTemplate[] = [
      {
        id: 'task-a',
        title: 'Task A',
        category: 'decor',
        daysBeforeEvent: 30,
        dependsOn: ['task-b'],
      },
      {
        id: 'task-b',
        title: 'Task B',
        category: 'decor',
        daysBeforeEvent: 40,
        dependsOn: ['task-a'],
      },
    ];
    const cycle = detectCycles(tasks);
    expect(cycle).not.toBeNull();
    expect(cycle).toContain('task-a');
    expect(cycle).toContain('task-b');
  });

  it('detects an indirect cycle (A -> B -> C -> A)', () => {
    const tasks: TaskTemplate[] = [
      {
        id: 'task-a',
        title: 'Task A',
        category: 'venue',
        daysBeforeEvent: 60,
        dependsOn: ['task-b'],
      },
      {
        id: 'task-b',
        title: 'Task B',
        category: 'venue',
        daysBeforeEvent: 40,
        dependsOn: ['task-c'],
      },
      {
        id: 'task-c',
        title: 'Task C',
        category: 'venue',
        daysBeforeEvent: 20,
        dependsOn: ['task-a'],
      },
    ];
    const cycle = detectCycles(tasks);
    expect(cycle).not.toBeNull();
  });

  it('returns null when task dependencies form a valid DAG', () => {
    const tasks: TaskTemplate[] = [
      { id: 'venue', title: 'Book Venue', category: 'venue', daysBeforeEvent: 180, dependsOn: [] },
      {
        id: 'catering',
        title: 'Select Caterer',
        category: 'catering',
        daysBeforeEvent: 120,
        dependsOn: ['venue'],
      },
      {
        id: 'tasting',
        title: 'Food Tasting',
        category: 'catering',
        daysBeforeEvent: 60,
        dependsOn: ['catering'],
      },
    ];
    expect(detectCycles(tasks)).toBeNull();
  });

  it('back-schedules tasks from event date and sorts chronologically', () => {
    const eventDate = '2026-10-15';
    const tasks: TaskTemplate[] = [
      {
        id: 'tasting',
        title: 'Food Tasting',
        category: 'catering',
        daysBeforeEvent: 30,
        dependsOn: ['catering'],
      },
      {
        id: 'catering',
        title: 'Select Caterer',
        category: 'catering',
        daysBeforeEvent: 90,
        dependsOn: ['venue'],
      },
      { id: 'venue', title: 'Book Venue', category: 'venue', daysBeforeEvent: 180, dependsOn: [] },
    ];

    const scheduled = backScheduleTimeline(eventDate, tasks);
    expect(scheduled).toHaveLength(3);
    expect(scheduled[0]?.id).toBe('venue'); // Earliest task (180 days before)
    expect(scheduled[1]?.id).toBe('catering'); // 90 days before
    expect(scheduled[2]?.id).toBe('tasting'); // 30 days before

    expect(scheduled[0]?.dueDate).toBe('2026-04-18');
  });

  it('adjusts schedule if a dependent task is mistakenly scheduled earlier than prerequisite', () => {
    const eventDate = '2026-10-15';
    const tasks: TaskTemplate[] = [
      // Prerequisite is scheduled 30 days before event
      {
        id: 'prereq',
        title: 'Contract Signed',
        category: 'venue',
        daysBeforeEvent: 30,
        dependsOn: [],
      },
      // Dependent mistakenly configured 60 days before event (earlier than prereq)
      {
        id: 'dep',
        title: 'Deposit Paid',
        category: 'venue',
        daysBeforeEvent: 60,
        dependsOn: ['prereq'],
      },
    ];

    const scheduled = backScheduleTimeline(eventDate, tasks);
    const prereq = scheduled.find((t) => t.id === 'prereq');
    const dep = scheduled.find((t) => t.id === 'dep');

    expect(prereq).toBeDefined();
    expect(dep).toBeDefined();
    if (dep && prereq) {
      expect(dep.dueDate.localeCompare(prereq.dueDate)).toBeGreaterThanOrEqual(0);
    }
  });

  it('rejects back-scheduling when a cyclic dependency is present', () => {
    const tasks: TaskTemplate[] = [
      { id: 'a', title: 'A', category: 'cat', daysBeforeEvent: 20, dependsOn: ['b'] },
      { id: 'b', title: 'B', category: 'cat', daysBeforeEvent: 10, dependsOn: ['a'] },
    ];
    expect(() => backScheduleTimeline('2026-12-01', tasks)).toThrowError(
      /Cyclic dependency detected/
    );
  });

  it('throws error when a referenced dependency does not exist', () => {
    const tasks: TaskTemplate[] = [
      { id: 'a', title: 'A', category: 'cat', daysBeforeEvent: 20, dependsOn: ['non-existent'] },
    ];
    expect(() => backScheduleTimeline('2026-12-01', tasks)).toThrowError(
      /Referenced task ID not found/
    );
  });
});

describe('planTimeline Context-Aware Scheduler', () => {
  const sampleTemplates: readonly TaskTemplate[] = [
    {
      id: 'venue',
      title: 'Book Venue',
      category: 'venue',
      daysBeforeEvent: 60,
      dependsOn: [],
    },
    {
      id: 'catering',
      title: 'Confirm Menu',
      category: 'catering',
      daysBeforeEvent: 30,
      dependsOn: ['venue'],
    },
    {
      id: 'invites',
      title: 'Send RSVPs',
      category: 'logistics',
      daysBeforeEvent: 14,
      dependsOn: ['catering'],
    },
  ];

  it('calculates days between dates correctly', () => {
    expect(computeDaysBetween('2026-11-16', '2026-10-26')).toBe(21);
    expect(computeDaysBetween('2026-10-26', '2026-10-26')).toBe(0);
  });

  it('compresses lead times proportionally when longest lead exceeds days remaining', () => {
    const today = '2026-10-26';
    const eventDate = '2026-11-16'; // 21 days away, max lead = 60 -> ratio = 21/60 = 0.35 (35%)

    const result = planTimeline(eventDate, sampleTemplates, today);

    expect(result.reasons).toContain('Event is 21 days away: lead times compressed to 35%');
    expect(result.tasks).toHaveLength(3);

    const venue = result.tasks[0];
    const catering = result.tasks[1];
    const invites = result.tasks[2];

    expect(venue && venue.flags.includes('compressed')).toBe(true);
    expect(catering && catering.flags.includes('compressed')).toBe(true);
    expect(invites && invites.flags.includes('compressed')).toBe(true);

    if (venue && catering && invites) {
      expect(venue.dueDate.localeCompare(catering.dueDate)).toBeLessThanOrEqual(0);
      expect(catering.dueDate.localeCompare(invites.dueDate)).toBeLessThanOrEqual(0);
    }
  });

  it('marks tasks due before today as overdue', () => {
    const today = '2026-10-26';
    const fitTemplates: readonly TaskTemplate[] = [
      {
        id: 'task-past',
        title: 'Past Task',
        category: 'venue',
        daysBeforeEvent: 10,
        dependsOn: [],
      },
    ];

    const pastResult = planTimeline('2026-10-20', fitTemplates, today);
    const firstTask = pastResult.tasks[0];
    expect(firstTask && firstTask.flags.includes('overdue')).toBe(true);
    expect(firstTask && firstTask.isOverdue).toBe(true);
    expect(pastResult.reasons.some((r) => r.includes('due before today marked as overdue'))).toBe(
      true
    );
  });

  it('schedules without compression when lead times fit within the window', () => {
    const today = '2026-01-01';
    const eventDate = '2026-12-01'; // 334 days away, max lead = 180

    const result = planTimeline(eventDate, DEFAULT_TIMELINE_TEMPLATES, today);

    expect(result.reasons).toEqual([]);
    expect(result.tasks.every((t) => !t.flags.includes('compressed'))).toBe(true);
    expect(result.tasks.every((t) => !t.flags.includes('overdue'))).toBe(true);
  });

  it('rejects malformed date strings', () => {
    expect(() => planTimeline('invalid', sampleTemplates, '2026-10-26')).toThrowError(
      /Invalid date format/
    );
    expect(() => planTimeline('2026-10-26', sampleTemplates, 'invalid')).toThrowError(
      /Invalid date format/
    );
  });

  it('rejects cyclic task templates', () => {
    const cycleTasks: TaskTemplate[] = [
      { id: 'c1', title: 'C1', category: 'decor', daysBeforeEvent: 20, dependsOn: ['c2'] },
      { id: 'c2', title: 'C2', category: 'decor', daysBeforeEvent: 10, dependsOn: ['c1'] },
    ];
    expect(() => planTimeline('2026-11-20', cycleTasks, '2026-10-26')).toThrowError(
      /Cyclic dependency detected/
    );
  });
});
