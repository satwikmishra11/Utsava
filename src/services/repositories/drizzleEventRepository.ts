import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, and, inArray, sql } from 'drizzle-orm';
import * as schema from '@/domain/db/schema';
import { Event, BudgetItem, TimelineTask, Vendor, IdeaSet, EventType } from '@/domain/schemas';
import { EventRepository, EventQueryOptions, EventDetails } from './eventRepository';
import { bootstrapSqlite } from './sqliteBootstrap';
import {
  mapEventRow,
  mapBudgetItemRow,
  mapTimelineTaskRow,
  mapVendorRow,
  mapIdeaSetRow,
  mergeBudgetItem,
  mergeTimelineTask,
  mergeVendor,
  assembleBatchDetails,
  fetchBatchRelationRows,
} from './mappers';

export class DrizzleEventRepository implements EventRepository {
  private readonly sqlite: Database.Database;
  private readonly db: BetterSQLite3Database<typeof schema>;

  constructor(sqliteInstance?: Database.Database) {
    this.sqlite = sqliteInstance ?? new Database(':memory:');
    bootstrapSqlite(this.sqlite);
    this.db = drizzle(this.sqlite, { schema });
  }

  public async createEvent(event: Event): Promise<Event> {
    this.db
      .insert(schema.events)
      .values({
        ...event,
        userId: event.userId ?? 'usr_default',
      })
      .run();
    return event;
  }

  public async getEventById(id: string, userId?: string): Promise<Event | null> {
    const condition = userId
      ? and(eq(schema.events.id, id), eq(schema.events.userId, userId))
      : eq(schema.events.id, id);
    const row = this.db.select().from(schema.events).where(condition).get();
    return row ? mapEventRow(row) : null;
  }

  public async listEvents(userId?: string, options?: EventQueryOptions): Promise<readonly Event[]> {
    const conditions = [];
    if (userId) conditions.push(eq(schema.events.userId, userId));
    if (options?.type) conditions.push(eq(schema.events.type, options.type));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    let query = this.db.select().from(schema.events);
    if (whereClause) query = query.where(whereClause) as typeof query;
    if (options?.limit !== undefined) query = query.limit(options.limit) as typeof query;
    if (options?.offset !== undefined) query = query.offset(options.offset) as typeof query;
    return query.all().map(mapEventRow);
  }

  public async countEvents(userId?: string, type?: EventType): Promise<number> {
    const conditions = [];
    if (userId) conditions.push(eq(schema.events.userId, userId));
    if (type) conditions.push(eq(schema.events.type, type));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const baseQuery = this.db.select({ count: sql<number>`count(*)` }).from(schema.events);
    const row = whereClause ? baseQuery.where(whereClause).get() : baseQuery.get();
    return Number(row?.count ?? 0);
  }

  public async updateEvent(
    id: string,
    updates: Partial<Event>,
    userId?: string
  ): Promise<Event | null> {
    const existing = await this.getEventById(id, userId);
    if (!existing) return null;
    const merged: Event = { ...existing, ...updates };
    this.db.update(schema.events).set(merged).where(eq(schema.events.id, id)).run();
    return merged;
  }

  public async deleteEvent(id: string, userId?: string): Promise<boolean> {
    const condition = userId
      ? and(eq(schema.events.id, id), eq(schema.events.userId, userId))
      : eq(schema.events.id, id);
    const res = this.db.delete(schema.events).where(condition).run();
    return res.changes > 0;
  }

  public async isEventOwner(eventId: string, userId: string): Promise<boolean> {
    const ev = await this.getEventById(eventId, userId);
    return ev !== null;
  }

  public async addBudgetItem(item: BudgetItem): Promise<BudgetItem> {
    this.db
      .insert(schema.budgetItems)
      .values({
        ...item,
        vendorId: item.vendorId ?? null,
        notes: item.notes ?? null,
      })
      .run();
    return item;
  }

  public async getBudgetItems(eventId: string): Promise<readonly BudgetItem[]> {
    const rows = this.db
      .select()
      .from(schema.budgetItems)
      .where(eq(schema.budgetItems.eventId, eventId))
      .all();
    return rows.map(mapBudgetItemRow);
  }

  public async updateBudgetItem(
    id: string,
    updates: Partial<BudgetItem>
  ): Promise<BudgetItem | null> {
    const row = this.db
      .select()
      .from(schema.budgetItems)
      .where(eq(schema.budgetItems.id, id))
      .get();
    if (!row) return null;
    const merged = mergeBudgetItem(row, updates);
    this.db
      .update(schema.budgetItems)
      .set({
        category: merged.category,
        estimated: merged.estimated,
        actual: merged.actual,
        vendorId: merged.vendorId ?? null,
        notes: merged.notes ?? null,
      })
      .where(eq(schema.budgetItems.id, id))
      .run();
    return merged;
  }

  public async deleteBudgetItem(id: string): Promise<boolean> {
    const res = this.db.delete(schema.budgetItems).where(eq(schema.budgetItems.id, id)).run();
    return res.changes > 0;
  }

  public async addTimelineTask(task: TimelineTask): Promise<TimelineTask> {
    this.db
      .insert(schema.timelineTasks)
      .values({
        ...task,
        dependsOn: [...task.dependsOn],
        assignee: task.assignee ?? null,
      })
      .run();
    return task;
  }

  public async getTimelineTasks(eventId: string): Promise<readonly TimelineTask[]> {
    const rows = this.db
      .select()
      .from(schema.timelineTasks)
      .where(eq(schema.timelineTasks.eventId, eventId))
      .all();
    return rows.map(mapTimelineTaskRow);
  }

  public async updateTimelineTask(
    id: string,
    updates: Partial<TimelineTask>
  ): Promise<TimelineTask | null> {
    const row = this.db
      .select()
      .from(schema.timelineTasks)
      .where(eq(schema.timelineTasks.id, id))
      .get();
    if (!row) return null;
    const merged = mergeTimelineTask(row, updates);
    this.db
      .update(schema.timelineTasks)
      .set({
        title: merged.title,
        dueDate: merged.dueDate,
        status: merged.status,
        dependsOn: [...merged.dependsOn],
        category: merged.category,
        assignee: merged.assignee ?? null,
      })
      .where(eq(schema.timelineTasks.id, id))
      .run();
    return merged;
  }

  public async deleteTimelineTask(id: string): Promise<boolean> {
    const res = this.db.delete(schema.timelineTasks).where(eq(schema.timelineTasks.id, id)).run();
    return res.changes > 0;
  }

  public async addVendor(vendor: Vendor): Promise<Vendor> {
    this.db.insert(schema.vendors).values(vendor).run();
    return vendor;
  }

  public async getVendors(eventId: string): Promise<readonly Vendor[]> {
    const rows = this.db
      .select()
      .from(schema.vendors)
      .where(eq(schema.vendors.eventId, eventId))
      .all();
    return rows.map(mapVendorRow);
  }

  public async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    const row = this.db.select().from(schema.vendors).where(eq(schema.vendors.id, id)).get();
    if (!row) return null;
    const merged = mergeVendor(row, updates);
    this.db
      .update(schema.vendors)
      .set({
        category: merged.category,
        name: merged.name,
        contact: merged.contact,
        quote: merged.quote,
        status: merged.status,
      })
      .where(eq(schema.vendors.id, id))
      .run();
    return merged;
  }

  public async deleteVendor(id: string): Promise<boolean> {
    const res = this.db.delete(schema.vendors).where(eq(schema.vendors.id, id)).run();
    return res.changes > 0;
  }

  public async saveIdeaSet(ideaSet: IdeaSet): Promise<IdeaSet> {
    this.db
      .insert(schema.ideaSets)
      .values({
        ...ideaSet,
        decor: [...ideaSet.decor],
        menu: [...ideaSet.menu],
        activities: [...ideaSet.activities],
      })
      .run();
    return ideaSet;
  }

  public async getIdeaSets(eventId: string): Promise<readonly IdeaSet[]> {
    const rows = this.db
      .select()
      .from(schema.ideaSets)
      .where(eq(schema.ideaSets.eventId, eventId))
      .all();
    return rows.map(mapIdeaSetRow);
  }

  public async getEventWithDetails(id: string, userId?: string): Promise<EventDetails | null> {
    const event = await this.getEventById(id, userId);
    if (!event) return null;
    const [budgetItems, timelineTasks, vendors, ideaSets] = await Promise.all([
      this.getBudgetItems(id),
      this.getTimelineTasks(id),
      this.getVendors(id),
      this.getIdeaSets(id),
    ]);
    return { event, budgetItems, timelineTasks, vendors, ideaSets };
  }

  public async getBatchEventsWithDetails(
    eventIds: readonly string[],
    userId?: string
  ): Promise<readonly EventDetails[]> {
    if (eventIds.length === 0) return [];
    const eventConditions = [inArray(schema.events.id, [...eventIds])];
    if (userId) eventConditions.push(eq(schema.events.userId, userId));
    const eventRows = this.db
      .select()
      .from(schema.events)
      .where(and(...eventConditions))
      .all();
    const matchedIds = eventRows.map((e) => e.id);
    if (matchedIds.length === 0) return [];

    const [budgetRows, timelineRows, vendorRows, ideaRows] = await fetchBatchRelationRows(
      this.db,
      matchedIds
    );

    return assembleBatchDetails(eventRows, budgetRows, timelineRows, vendorRows, ideaRows);
  }
}
