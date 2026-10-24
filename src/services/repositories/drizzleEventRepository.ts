import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '@/domain/db/schema';
import {
  Event,
  BudgetItem,
  TimelineTask,
  Vendor,
  IdeaSet,
  EventType,
  BudgetCategory,
  TimelineTaskStatus,
  VendorStatus,
} from '@/domain/schemas';
import { EventRepository } from './eventRepository';

export class DrizzleEventRepository implements EventRepository {
  private readonly sqlite: Database.Database;
  private readonly db: BetterSQLite3Database<typeof schema>;

  constructor(sqliteInstance?: Database.Database) {
    this.sqlite = sqliteInstance ?? new Database(':memory:');
    this.sqlite.pragma('foreign_keys = ON');
    this.initTables();
    this.db = drizzle(this.sqlite, { schema });
  }

  private initTables(): void {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        location TEXT NOT NULL,
        total_budget REAL NOT NULL,
        currency TEXT NOT NULL,
        preferences TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS budget_items (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        estimated REAL NOT NULL,
        actual REAL NOT NULL,
        vendor_id TEXT,
        notes TEXT
      );
      CREATE TABLE IF NOT EXISTS timeline_tasks (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL,
        depends_on TEXT NOT NULL,
        category TEXT NOT NULL,
        assignee TEXT
      );
      CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        quote REAL NOT NULL,
        status TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS idea_sets (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        theme TEXT NOT NULL,
        decor TEXT NOT NULL,
        menu TEXT NOT NULL,
        activities TEXT NOT NULL,
        generated_metadata TEXT NOT NULL
      );
    `);
  }

  public async createEvent(event: Event): Promise<Event> {
    this.db
      .insert(schema.events)
      .values({
        id: event.id,
        type: event.type,
        title: event.title,
        date: event.date,
        guestCount: event.guestCount,
        location: event.location,
        totalBudget: event.totalBudget,
        currency: event.currency,
        preferences: event.preferences,
        createdAt: event.createdAt,
      })
      .run();
    return event;
  }

  public async getEventById(id: string): Promise<Event | null> {
    const row = this.db.select().from(schema.events).where(eq(schema.events.id, id)).get();
    if (!row) return null;
    return {
      id: row.id,
      type: row.type as EventType,
      title: row.title,
      date: row.date,
      guestCount: row.guestCount,
      location: row.location,
      totalBudget: row.totalBudget,
      currency: row.currency,
      preferences: row.preferences,
      createdAt: row.createdAt,
    };
  }

  public async listEvents(): Promise<readonly Event[]> {
    const rows = this.db.select().from(schema.events).all();
    return rows.map((r) => ({
      id: r.id,
      type: r.type as EventType,
      title: r.title,
      date: r.date,
      guestCount: r.guestCount,
      location: r.location,
      totalBudget: r.totalBudget,
      currency: r.currency,
      preferences: r.preferences,
      createdAt: r.createdAt,
    }));
  }

  public async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const existing = await this.getEventById(id);
    if (!existing) return null;
    const merged: Event = { ...existing, ...updates };

    this.db
      .update(schema.events)
      .set({
        type: merged.type,
        title: merged.title,
        date: merged.date,
        guestCount: merged.guestCount,
        location: merged.location,
        totalBudget: merged.totalBudget,
        currency: merged.currency,
        preferences: merged.preferences,
      })
      .where(eq(schema.events.id, id))
      .run();

    return merged;
  }

  public async deleteEvent(id: string): Promise<boolean> {
    const res = this.db.delete(schema.events).where(eq(schema.events.id, id)).run();
    return res.changes > 0;
  }

  public async addBudgetItem(item: BudgetItem): Promise<BudgetItem> {
    this.db
      .insert(schema.budgetItems)
      .values({
        id: item.id,
        eventId: item.eventId,
        category: item.category,
        estimated: item.estimated,
        actual: item.actual,
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
    return rows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      category: r.category as BudgetCategory,
      estimated: r.estimated,
      actual: r.actual,
      vendorId: r.vendorId ?? undefined,
      notes: r.notes ?? undefined,
    }));
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
    const merged: BudgetItem = {
      id: row.id,
      eventId: row.eventId,
      category: (updates.category ?? row.category) as BudgetCategory,
      estimated: updates.estimated ?? row.estimated,
      actual: updates.actual ?? row.actual,
      vendorId: updates.vendorId !== undefined ? updates.vendorId : (row.vendorId ?? undefined),
      notes: updates.notes !== undefined ? updates.notes : (row.notes ?? undefined),
    };
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
        id: task.id,
        eventId: task.eventId,
        title: task.title,
        dueDate: task.dueDate,
        status: task.status,
        dependsOn: [...task.dependsOn],
        category: task.category,
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
    return rows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      title: r.title,
      dueDate: r.dueDate,
      status: r.status as TimelineTaskStatus,
      dependsOn: r.dependsOn,
      category: r.category,
      assignee: r.assignee ?? undefined,
    }));
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
    const merged: TimelineTask = {
      id: row.id,
      eventId: row.eventId,
      title: updates.title ?? row.title,
      dueDate: updates.dueDate ?? row.dueDate,
      status: (updates.status ?? row.status) as TimelineTaskStatus,
      dependsOn: updates.dependsOn ?? row.dependsOn,
      category: updates.category ?? row.category,
      assignee: updates.assignee !== undefined ? updates.assignee : (row.assignee ?? undefined),
    };
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
    this.db
      .insert(schema.vendors)
      .values({
        id: vendor.id,
        eventId: vendor.eventId,
        category: vendor.category,
        name: vendor.name,
        contact: vendor.contact,
        quote: vendor.quote,
        status: vendor.status,
      })
      .run();
    return vendor;
  }

  public async getVendors(eventId: string): Promise<readonly Vendor[]> {
    const rows = this.db
      .select()
      .from(schema.vendors)
      .where(eq(schema.vendors.eventId, eventId))
      .all();
    return rows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      category: r.category as BudgetCategory,
      name: r.name,
      contact: r.contact,
      quote: r.quote,
      status: r.status as VendorStatus,
    }));
  }

  public async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    const row = this.db.select().from(schema.vendors).where(eq(schema.vendors.id, id)).get();
    if (!row) return null;
    const merged: Vendor = {
      id: row.id,
      eventId: row.eventId,
      category: (updates.category ?? row.category) as BudgetCategory,
      name: updates.name ?? row.name,
      contact: updates.contact ?? row.contact,
      quote: updates.quote ?? row.quote,
      status: (updates.status ?? row.status) as VendorStatus,
    };
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
        id: ideaSet.id,
        eventId: ideaSet.eventId,
        theme: ideaSet.theme,
        decor: [...ideaSet.decor],
        menu: [...ideaSet.menu],
        activities: [...ideaSet.activities],
        generatedMetadata: ideaSet.generatedMetadata,
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
    return rows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      theme: r.theme,
      decor: r.decor,
      menu: r.menu,
      activities: r.activities,
      generatedMetadata: r.generatedMetadata,
    }));
  }
}
