import { describe, it, expect } from 'vitest';
import { subtractDays, detectCycles, backScheduleTimeline, TaskTemplate } from '../timelineLogic';

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

    // Dependent's dueDate must not precede prerequisite's dueDate
    expect(dep?.dueDate).toBeGreaterThanOrEqual(prereq!.dueDate);
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
