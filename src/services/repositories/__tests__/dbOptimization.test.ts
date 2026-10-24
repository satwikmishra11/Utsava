import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { DrizzleEventRepository } from '../drizzleEventRepository';
import { Event } from '@/domain/schemas';

describe('Database Optimizations, Indexing & Batch Querying Suite', () => {
  let sqlite: Database.Database;
  let repo: DrizzleEventRepository;

  const baseEvent = (id: string, title: string, userId: string = 'usr_1'): Event => ({
    id,
    userId,
    type: 'wedding',
    title,
    date: '2026-12-01',
    guestCount: 150,
    location: 'Grand Ballroom',
    totalBudget: 35000,
    currency: 'USD',
    preferences: { culture: 'Contemporary', dietary: [], accessibilityNeeds: [] },
    createdAt: new Date().toISOString(),
  });

  beforeEach(() => {
    sqlite = new Database(':memory:');
    repo = new DrizzleEventRepository(sqlite);
  });

  it('paginates event lists directly at the SQL layer with limit and offset', async () => {
    for (let i = 1; i <= 15; i++) {
      await repo.createEvent(baseEvent(`evt-${i}`, `Wedding ${i}`));
    }

    const page1 = await repo.listEvents('usr_1', { limit: 5, offset: 0 });
    expect(page1).toHaveLength(5);
    expect(page1[0]?.id).toBe('evt-1');

    const page2 = await repo.listEvents('usr_1', { limit: 5, offset: 5 });
    expect(page2).toHaveLength(5);
    expect(page2[0]?.id).toBe('evt-6');

    const totalCount = await repo.countEvents('usr_1');
    expect(totalCount).toBe(15);
  });

  it('fetches complete event with details in parallel', async () => {
    await repo.createEvent(baseEvent('evt-detail-1', 'Detail Event'));
    await repo.addBudgetItem({
      id: 'b-1',
      eventId: 'evt-detail-1',
      category: 'catering',
      estimated: 5000,
      actual: 4500,
    });
    await repo.addTimelineTask({
      id: 't-1',
      eventId: 'evt-detail-1',
      title: 'Setup stage',
      dueDate: '2026-12-01',
      status: 'pending',
      dependsOn: [],
      category: 'logistics',
    });

    const details = await repo.getEventWithDetails('evt-detail-1', 'usr_1');
    expect(details).not.toBeNull();
    expect(details?.event.title).toBe('Detail Event');
    expect(details?.budgetItems).toHaveLength(1);
    expect(details?.timelineTasks).toHaveLength(1);
  });

  it('batches multiple events with related entities eliminating N+1 queries', async () => {
    await repo.createEvent(baseEvent('evt-batch-1', 'Batch 1'));
    await repo.createEvent(baseEvent('evt-batch-2', 'Batch 2'));

    await repo.addBudgetItem({
      id: 'b-1',
      eventId: 'evt-batch-1',
      category: 'venue',
      estimated: 10000,
      actual: 10000,
    });
    await repo.addBudgetItem({
      id: 'b-2',
      eventId: 'evt-batch-2',
      category: 'photography',
      estimated: 3000,
      actual: 3000,
    });

    const batch = await repo.getBatchEventsWithDetails(['evt-batch-1', 'evt-batch-2'], 'usr_1');
    expect(batch).toHaveLength(2);
    expect(batch.find((b) => b.event.id === 'evt-batch-1')?.budgetItems).toHaveLength(1);
    expect(batch.find((b) => b.event.id === 'evt-batch-2')?.budgetItems).toHaveLength(1);
  });
});
