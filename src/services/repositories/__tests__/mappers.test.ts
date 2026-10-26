import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { bootstrapSqlite } from '../sqliteBootstrap';
import {
  mapEventRow,
  mapBudgetItemRow,
  mapTimelineTaskRow,
  mapVendorRow,
  mapIdeaSetRow,
  mergeBudgetItem,
  mergeTimelineTask,
  mergeVendor,
  mapBudgetByEvent,
  mapTimelineByEvent,
  mapVendorsByEvent,
  mapIdeasByEvent,
  assembleBatchDetails,
} from '../mappers';

describe('sqliteBootstrap', () => {
  it('creates tables and enables foreign keys without error', () => {
    const db = new Database(':memory:');
    bootstrapSqlite(db);
    const row = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='events'")
      .get();
    expect(row).toBeDefined();
  });
});

describe('Repository Mappers', () => {
  it('maps event row accurately', () => {
    const raw = {
      id: 'e1',
      userId: 'u1',
      type: 'wedding',
      title: 'Wedding Gala',
      date: '2026-10-10',
      guestCount: 100,
      location: 'City Hall',
      totalBudget: 20000,
      currency: 'INR',
      preferences: { culture: 'South Asian', dietary: [], accessibilityNeeds: [] },
      createdAt: '2026-01-01',
    };
    const event = mapEventRow(raw);
    expect(event.id).toBe('e1');
    expect(event.title).toBe('Wedding Gala');
    expect(event.type).toBe('wedding');
  });

  it('maps and merges budget item row', () => {
    const raw = {
      id: 'b1',
      eventId: 'e1',
      category: 'catering',
      estimated: 1000,
      actual: 500,
      vendorId: null,
      notes: null,
    };
    const mapped = mapBudgetItemRow(raw);
    expect(mapped.vendorId).toBeUndefined();
    expect(mapped.notes).toBeUndefined();

    const merged = mergeBudgetItem(raw, { estimated: 1200, notes: 'Updated notes' });
    expect(merged.estimated).toBe(1200);
    expect(merged.notes).toBe('Updated notes');
    expect(merged.actual).toBe(500);
  });

  it('maps and merges timeline task row', () => {
    const raw = {
      id: 't1',
      eventId: 'e1',
      title: 'Setup',
      dueDate: '2026-10-10',
      status: 'pending',
      dependsOn: ['t0'],
      category: 'setup',
      assignee: null,
    };
    const mapped = mapTimelineTaskRow(raw);
    expect(mapped.status).toBe('pending');
    expect(mapped.assignee).toBeUndefined();

    const merged = mergeTimelineTask(raw, { status: 'completed', assignee: 'John' });
    expect(merged.status).toBe('completed');
    expect(merged.assignee).toBe('John');
  });

  it('maps and merges vendor row', () => {
    const raw = {
      id: 'v1',
      eventId: 'e1',
      category: 'catering',
      name: 'Chef Stars',
      contact: 'test@example.com',
      quote: 3000,
      status: 'shortlisted',
    };
    const mapped = mapVendorRow(raw);
    expect(mapped.quote).toBe(3000);

    const merged = mergeVendor(raw, { quote: 3500, status: 'booked' });
    expect(merged.quote).toBe(3500);
    expect(merged.status).toBe('booked');
  });

  it('maps idea set row', () => {
    const raw = {
      id: 'i1',
      eventId: 'e1',
      theme: 'Royal',
      decor: ['flowers'],
      menu: ['biryani'],
      activities: ['dancing'],
      generatedMetadata: { source: 'ai' },
    };
    const mapped = mapIdeaSetRow(raw);
    expect(mapped.theme).toBe('Royal');
    expect(mapped.decor).toEqual(['flowers']);
  });

  it('groups entities by event and assembles batch details', () => {
    const eventRows = [
      {
        id: 'e1',
        userId: 'u1',
        type: 'wedding',
        title: 'Wedding 1',
        date: '2026-10-10',
        guestCount: 50,
        location: 'Hall',
        totalBudget: 10000,
        currency: 'INR',
        preferences: { dietary: [], accessibilityNeeds: [] },
        createdAt: '2026-01-01',
      },
    ];
    const budgetRows = [
      {
        id: 'b1',
        eventId: 'e1',
        category: 'venue',
        estimated: 500,
        actual: 500,
        vendorId: null,
        notes: null,
      },
    ];
    const timelineRows = [
      {
        id: 't1',
        eventId: 'e1',
        title: 'Start',
        dueDate: '10:00',
        status: 'pending',
        dependsOn: [],
        category: 'venue',
        assignee: null,
      },
    ];
    const vendorRows = [
      {
        id: 'v1',
        eventId: 'e1',
        category: 'venue',
        name: 'Hall',
        contact: '123',
        quote: 500,
        status: 'shortlisted',
      },
    ];
    const ideaRows = [
      {
        id: 'i1',
        eventId: 'e1',
        theme: 'Luxe',
        decor: [],
        menu: [],
        activities: [],
        generatedMetadata: {},
      },
    ];

    expect(mapBudgetByEvent(budgetRows).get('e1')).toHaveLength(1);
    expect(mapTimelineByEvent(timelineRows).get('e1')).toHaveLength(1);
    expect(mapVendorsByEvent(vendorRows).get('e1')).toHaveLength(1);
    expect(mapIdeasByEvent(ideaRows).get('e1')).toHaveLength(1);

    const batch = assembleBatchDetails(eventRows, budgetRows, timelineRows, vendorRows, ideaRows);
    expect(batch).toHaveLength(1);
    expect(batch[0]?.event.id).toBe('e1');
    expect(batch[0]?.budgetItems).toHaveLength(1);
    expect(batch[0]?.timelineTasks).toHaveLength(1);
    expect(batch[0]?.vendors).toHaveLength(1);
    expect(batch[0]?.ideaSets).toHaveLength(1);
  });
});
