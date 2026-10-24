import { describe, it, expect, beforeEach } from 'vitest';
import { DrizzleEventRepository } from '../drizzleEventRepository';
import { Event } from '@/domain/schemas';

describe('DrizzleEventRepository (SQLite in-memory)', () => {
  let repo: DrizzleEventRepository;

  const sampleEvent: Event = {
    id: 'evt-test-1',
    type: 'wedding',
    title: 'Heritage Royal Wedding',
    date: '2026-11-20',
    guestCount: 250,
    location: 'Grand Ballroom, Chicago',
    totalBudget: 45000,
    currency: 'USD',
    preferences: {
      culture: 'South Asian',
      theme: 'Mughal Elegance',
      dietary: ['Halal', 'Vegetarian'],
      accessibilityNeeds: ['Wheelchair Access'],
    },
    userId: 'usr_test_1',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    repo = new DrizzleEventRepository(); // uses fresh :memory: database per test
  });

  it('creates and retrieves an event by ID', async () => {
    await repo.createEvent(sampleEvent);
    const retrieved = await repo.getEventById('evt-test-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Heritage Royal Wedding');
    expect(retrieved?.preferences.dietary).toContain('Halal');
  });

  it('returns null when event does not exist', async () => {
    const retrieved = await repo.getEventById('non-existent');
    expect(retrieved).toBeNull();
  });

  it('lists all saved events', async () => {
    await repo.createEvent(sampleEvent);
    await repo.createEvent({
      ...sampleEvent,
      id: 'evt-test-2',
      title: 'Devon 30th Birthday',
      type: 'birthday',
    });

    const all = await repo.listEvents();
    expect(all).toHaveLength(2);
  });

  it('updates an existing event', async () => {
    await repo.createEvent(sampleEvent);
    const updated = await repo.updateEvent('evt-test-1', {
      totalBudget: 52000,
      title: 'Updated Royal Wedding',
    });

    expect(updated?.totalBudget).toBe(52000);
    expect(updated?.title).toBe('Updated Royal Wedding');
    const fetched = await repo.getEventById('evt-test-1');
    expect(fetched?.totalBudget).toBe(52000);
  });

  it('deletes an event and cascade-deletes related items', async () => {
    await repo.createEvent(sampleEvent);
    await repo.addBudgetItem({
      id: 'b-1',
      eventId: 'evt-test-1',
      category: 'venue',
      estimated: 10000,
      actual: 9500,
    });

    const deleted = await repo.deleteEvent('evt-test-1');
    expect(deleted).toBe(true);

    const fetchedEvent = await repo.getEventById('evt-test-1');
    expect(fetchedEvent).toBeNull();

    const items = await repo.getBudgetItems('evt-test-1');
    expect(items).toHaveLength(0);
  });

  it('performs CRUD on BudgetItems', async () => {
    await repo.createEvent(sampleEvent);
    const item = await repo.addBudgetItem({
      id: 'b-100',
      eventId: 'evt-test-1',
      category: 'catering',
      estimated: 15000,
      actual: 0,
      notes: 'Buffet plus cocktail hour',
    });
    expect(item.id).toBe('b-100');

    const items = await repo.getBudgetItems('evt-test-1');
    expect(items).toHaveLength(1);
    expect(items[0]?.category).toBe('catering');

    const updated = await repo.updateBudgetItem('b-100', { actual: 14200 });
    expect(updated?.actual).toBe(14200);

    const deleted = await repo.deleteBudgetItem('b-100');
    expect(deleted).toBe(true);
    expect(await repo.getBudgetItems('evt-test-1')).toHaveLength(0);
  });

  it('performs CRUD on TimelineTasks', async () => {
    await repo.createEvent(sampleEvent);
    await repo.addTimelineTask({
      id: 'task-1',
      eventId: 'evt-test-1',
      title: 'Hire Photographer',
      dueDate: '2026-06-01',
      status: 'pending',
      dependsOn: [],
      category: 'photography',
    });

    const tasks = await repo.getTimelineTasks('evt-test-1');
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe('Hire Photographer');

    const updated = await repo.updateTimelineTask('task-1', { status: 'completed' });
    expect(updated?.status).toBe('completed');

    const deleted = await repo.deleteTimelineTask('task-1');
    expect(deleted).toBe(true);
  });

  it('performs CRUD on Vendors', async () => {
    await repo.createEvent(sampleEvent);
    await repo.addVendor({
      id: 'v-1',
      eventId: 'evt-test-1',
      category: 'venue',
      name: 'Grand Estate',
      contact: 'info@grandestate.test',
      quote: 12000,
      status: 'shortlisted',
    });

    const vendors = await repo.getVendors('evt-test-1');
    expect(vendors).toHaveLength(1);
    expect(vendors[0]?.name).toBe('Grand Estate');

    const updated = await repo.updateVendor('v-1', { status: 'booked' });
    expect(updated?.status).toBe('booked');

    const deleted = await repo.deleteVendor('v-1');
    expect(deleted).toBe(true);
  });

  it('saves and retrieves IdeaSets for an event', async () => {
    await repo.createEvent(sampleEvent);
    await repo.saveIdeaSet({
      id: 'idea-1',
      eventId: 'evt-test-1',
      theme: 'Royal Palace Twilight',
      decor: ['Marigold hanging bells', 'Fairy light tunnel'],
      menu: ['Paneer Tikka', 'Biryani Station'],
      activities: ['Live Sitar', 'Sangeet Choreography'],
      generatedMetadata: { model: 'claude-3-5-sonnet', tags: ['wedding', 'traditional'] },
    });

    const ideaSets = await repo.getIdeaSets('evt-test-1');
    expect(ideaSets).toHaveLength(1);
    expect(ideaSets[0]?.theme).toBe('Royal Palace Twilight');
    expect(ideaSets[0]?.decor).toContain('Marigold hanging bells');
  });
});
