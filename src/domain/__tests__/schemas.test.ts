import { describe, it, expect } from 'vitest';
import {
  EventSchema,
  BudgetItemSchema,
  TimelineTaskSchema,
  VendorSchema,
  IdeaSetSchema,
} from '../schemas';

describe('Domain Zod Schemas & Inferred Types', () => {
  it('validates a complete Event schema', () => {
    const valid = {
      id: 'evt-101',
      type: 'wedding',
      title: 'Aarav & Meera Wedding',
      date: '2026-12-25',
      guestCount: 200,
      location: 'Udaipur Palace',
      totalBudget: 50000,
      currency: 'USD',
      preferences: {
        culture: 'North Indian',
        theme: 'Royal Heritage',
        dietary: ['Vegetarian', 'Nut-Free'],
        accessibilityNeeds: ['Wheelchair Ramp'],
      },
      createdAt: new Date().toISOString(),
    };

    const parsed = EventSchema.parse(valid);
    expect(parsed.id).toBe('evt-101');
    expect(parsed.preferences.dietary).toHaveLength(2);
  });

  it('rejects an Event with invalid date format or negative budget', () => {
    expect(() =>
      EventSchema.parse({
        id: 'evt-bad',
        type: 'wedding',
        title: 'Bad Date',
        date: '25/12/2026', // invalid format
        guestCount: 50,
        location: 'City Hall',
        totalBudget: -500,
      })
    ).toThrow();
  });

  it('validates BudgetItemSchema with defaults', () => {
    const item = {
      id: 'b-10',
      eventId: 'evt-101',
      category: 'catering',
      estimated: 12000,
    };
    const parsed = BudgetItemSchema.parse(item);
    expect(parsed.actual).toBe(0);
    expect(parsed.estimated).toBe(12000);
  });

  it('validates TimelineTaskSchema and status transitions', () => {
    const task = {
      id: 'task-1',
      eventId: 'evt-101',
      title: 'Send Invitations',
      dueDate: '2026-10-01',
      category: 'logistics',
      dependsOn: ['task-0'],
    };
    const parsed = TimelineTaskSchema.parse(task);
    expect(parsed.status).toBe('pending');
    expect(parsed.dependsOn).toEqual(['task-0']);
  });

  it('validates VendorSchema quotes and statuses', () => {
    const vendor = {
      id: 'v-10',
      eventId: 'evt-101',
      category: 'photography',
      name: 'Lens Masters',
      contact: 'contact@lensmasters.test',
      quote: 3500,
      status: 'booked',
    };
    const parsed = VendorSchema.parse(vendor);
    expect(parsed.status).toBe('booked');
    expect(parsed.quote).toBe(3500);
  });

  it('validates IdeaSetSchema with default metadata', () => {
    const ideaSet = {
      id: 'idea-set-1',
      eventId: 'evt-101',
      theme: 'Enchanted Forest',
      decor: ['Fairy lights canopy', 'Moss runners'],
      menu: ['Wild mushroom tartlets', 'Forest berry sorbet'],
      activities: ['Live acoustic duo', 'Polaroid guest book'],
    };
    const parsed = IdeaSetSchema.parse(ideaSet);
    expect(parsed.theme).toBe('Enchanted Forest');
    expect(parsed.generatedMetadata).toEqual({});
  });

  it('rejects events with invalid types or non-positive guest counts', () => {
    expect(() =>
      EventSchema.parse({
        id: 'evt-fail',
        type: 'invalid_event_type' as any,
        title: 'Valid Title',
        date: '2026-12-01',
        guestCount: 0,
        totalBudget: 5000,
      })
    ).toThrow();
  });

  it('validates tool call schemas and rejects invalid parameters', async () => {
    const { AddTaskToolCallSchema, UpdateBudgetItemToolCallSchema, ShortlistVendorToolCallSchema } =
      await import('@/services/ai/types');

    const validTask = AddTaskToolCallSchema.parse({
      tool: 'add_task',
      parameters: {
        title: 'Review Seating Plan',
        category: 'venue',
        dueDate: '2026-10-15',
        dependsOn: [],
      },
    });
    expect(validTask.parameters.title).toBe('Review Seating Plan');

    expect(() =>
      AddTaskToolCallSchema.parse({
        tool: 'add_task',
        parameters: {
          title: '', // empty title rejected
          category: 'venue',
        },
      })
    ).toThrow();

    const validBudgetUpdate = UpdateBudgetItemToolCallSchema.parse({
      tool: 'update_budget_item',
      parameters: {
        category: 'catering',
        estimated: 8500,
      },
    });
    expect(validBudgetUpdate.parameters.estimated).toBe(8500);

    const validVendor = ShortlistVendorToolCallSchema.parse({
      tool: 'shortlist_vendor',
      parameters: {
        name: 'Apex DJ Services',
        category: 'entertainment',
        quote: 1200,
      },
    });
    expect(validVendor.parameters.name).toBe('Apex DJ Services');
  });
});
