import { describe, it, expect } from 'vitest';
import { applyToolCallToPlan } from '../planEditor';
import { EventPlan } from '@/domain/types';

const INITIAL_PLAN: EventPlan = {
  id: 'evt_plan_test',
  title: 'Test Wedding Gala',
  eventType: 'wedding',
  date: '2026-11-20',
  guestCount: 150,
  totalBudget: 35000,
  currency: 'INR',
  budgetItems: [
    {
      id: 'b-1',
      eventId: 'evt_plan_test',
      category: 'venue',
      estimated: 10000,
      actual: 5000,
      notes: 'Initial venue deposit',
    },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'ceremony',
      title: 'Ceremony Welcome',
      time: '14:00',
      durationMinutes: 45,
      completed: false,
    },
  ],
  vendors: [
    {
      id: 'v-1',
      category: 'photography',
      name: 'Silver Lens Studio',
      status: 'shortlisted',
      quotedAmount: 2500,
      deliverables: ['Full coverage'],
    },
  ],
  ideas: [],
};

describe('planEditor — applyToolCallToPlan', () => {
  it('applies add_task tool call adding a timeline milestone', () => {
    const updated = applyToolCallToPlan(INITIAL_PLAN, {
      tool: 'add_task',
      parameters: {
        title: 'Cake Tasting Session',
        dueDate: '11:00',
        category: 'catering',
      },
    });

    expect(updated.timelineItems.length).toBe(2);
    const added = updated.timelineItems.find((t) => t.title === 'Cake Tasting Session');
    expect(added).toBeDefined();
    expect(added?.time).toBe('11:00');
    expect(added?.phase).toBe('preparation');
    expect(added?.notes).toBe('catering');
  });

  it('applies add_task tool call with default time if dueDate omitted', () => {
    const updated = applyToolCallToPlan(INITIAL_PLAN, {
      tool: 'add_task',
      parameters: {
        title: 'Vendor Walkthrough',
        category: 'venue',
      },
    });

    const added = updated.timelineItems.find((t) => t.title === 'Vendor Walkthrough');
    expect(added?.time).toBe('09:00');
  });

  it('applies update_budget_item to existing category', () => {
    const updated = applyToolCallToPlan(INITIAL_PLAN, {
      tool: 'update_budget_item',
      parameters: {
        category: 'venue',
        estimated: 12500,
        notes: 'Upgraded to ballroom suite',
      },
    });

    expect(updated.budgetItems.length).toBe(1);
    const item = updated.budgetItems[0];
    expect(item?.estimated).toBe(12500);
    expect(item?.notes).toBe('Upgraded to ballroom suite');
  });

  it('applies update_budget_item creating new item when category does not exist', () => {
    const updated = applyToolCallToPlan(INITIAL_PLAN, {
      tool: 'update_budget_item',
      parameters: {
        category: 'entertainment',
        estimated: 3000,
        notes: 'Live acoustic band',
      },
    });

    expect(updated.budgetItems.length).toBe(2);
    const newItem = updated.budgetItems.find((b) => b.category === 'entertainment');
    expect(newItem).toBeDefined();
    expect(newItem?.estimated).toBe(3000);
    expect(newItem?.actual).toBe(0);
    expect(newItem?.notes).toBe('Live acoustic band');
  });

  it('applies shortlist_vendor tool call', () => {
    const updated = applyToolCallToPlan(INITIAL_PLAN, {
      tool: 'shortlist_vendor',
      parameters: {
        category: 'decor',
        name: 'Floral Dreams Bloom',
        contact: 'hello@floraldreams.com',
        quote: 4500,
      },
    });

    expect(updated.vendors.length).toBe(2);
    const vendor = updated.vendors.find((v) => v.name === 'Floral Dreams Bloom');
    expect(vendor).toBeDefined();
    expect(vendor?.category).toBe('decor');
    expect(vendor?.status).toBe('shortlisted');
    expect(vendor?.quotedAmount).toBe(4500);
    expect(vendor?.contactEmail).toBe('hello@floraldreams.com');
  });

  it('throws Zod validation error on unknown or malformed tool call', () => {
    expect(() =>
      applyToolCallToPlan(INITIAL_PLAN, {
        tool: 'delete_entire_database',
        parameters: {},
      })
    ).toThrow();
  });
});
