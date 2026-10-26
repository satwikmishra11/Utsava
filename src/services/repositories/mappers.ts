import { inArray } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
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
import { EventDetails } from './eventRepository';

export function mapEventRow(r: typeof schema.events.$inferSelect): Event {
  return {
    id: r.id,
    userId: r.userId,
    type: r.type as EventType,
    title: r.title,
    date: r.date,
    guestCount: r.guestCount,
    location: r.location,
    totalBudget: r.totalBudget,
    currency: r.currency,
    preferences: r.preferences,
    createdAt: r.createdAt,
  };
}

export function mapBudgetItemRow(r: typeof schema.budgetItems.$inferSelect): BudgetItem {
  return {
    id: r.id,
    eventId: r.eventId,
    category: r.category as BudgetCategory,
    estimated: r.estimated,
    actual: r.actual,
    vendorId: r.vendorId ?? undefined,
    notes: r.notes ?? undefined,
  };
}

export function mergeBudgetItem(
  row: typeof schema.budgetItems.$inferSelect,
  updates: Partial<BudgetItem>
): BudgetItem {
  return {
    id: row.id,
    eventId: row.eventId,
    category: (updates.category ?? row.category) as BudgetCategory,
    estimated: updates.estimated ?? row.estimated,
    actual: updates.actual ?? row.actual,
    vendorId: updates.vendorId !== undefined ? updates.vendorId : (row.vendorId ?? undefined),
    notes: updates.notes !== undefined ? updates.notes : (row.notes ?? undefined),
  };
}

export function mapTimelineTaskRow(r: typeof schema.timelineTasks.$inferSelect): TimelineTask {
  return {
    id: r.id,
    eventId: r.eventId,
    title: r.title,
    dueDate: r.dueDate,
    status: r.status as TimelineTaskStatus,
    dependsOn: r.dependsOn,
    category: r.category,
    assignee: r.assignee ?? undefined,
  };
}

export function mergeTimelineTask(
  row: typeof schema.timelineTasks.$inferSelect,
  updates: Partial<TimelineTask>
): TimelineTask {
  return {
    id: row.id,
    eventId: row.eventId,
    title: updates.title ?? row.title,
    dueDate: updates.dueDate ?? row.dueDate,
    status: (updates.status ?? row.status) as TimelineTaskStatus,
    dependsOn: updates.dependsOn ?? row.dependsOn,
    category: updates.category ?? row.category,
    assignee: updates.assignee !== undefined ? updates.assignee : (row.assignee ?? undefined),
  };
}

export function mapVendorRow(r: typeof schema.vendors.$inferSelect): Vendor {
  return {
    id: r.id,
    eventId: r.eventId,
    category: r.category as BudgetCategory,
    name: r.name,
    contact: r.contact,
    quote: r.quote,
    status: r.status as VendorStatus,
  };
}

export function mergeVendor(
  row: typeof schema.vendors.$inferSelect,
  updates: Partial<Vendor>
): Vendor {
  return {
    id: row.id,
    eventId: row.eventId,
    category: (updates.category ?? row.category) as BudgetCategory,
    name: updates.name ?? row.name,
    contact: updates.contact ?? row.contact,
    quote: updates.quote ?? row.quote,
    status: (updates.status ?? row.status) as VendorStatus,
  };
}

export function mapIdeaSetRow(r: typeof schema.ideaSets.$inferSelect): IdeaSet {
  return {
    id: r.id,
    eventId: r.eventId,
    theme: r.theme,
    decor: r.decor,
    menu: r.menu,
    activities: r.activities,
    generatedMetadata: r.generatedMetadata,
  };
}

export function mapBudgetByEvent(
  rows: readonly (typeof schema.budgetItems.$inferSelect)[]
): Map<string, BudgetItem[]> {
  const map = new Map<string, BudgetItem[]>();
  for (const r of rows) {
    const arr = map.get(r.eventId) ?? [];
    arr.push(mapBudgetItemRow(r));
    map.set(r.eventId, arr);
  }
  return map;
}

export function mapTimelineByEvent(
  rows: readonly (typeof schema.timelineTasks.$inferSelect)[]
): Map<string, TimelineTask[]> {
  const map = new Map<string, TimelineTask[]>();
  for (const r of rows) {
    const arr = map.get(r.eventId) ?? [];
    arr.push(mapTimelineTaskRow(r));
    map.set(r.eventId, arr);
  }
  return map;
}

export function mapVendorsByEvent(
  rows: readonly (typeof schema.vendors.$inferSelect)[]
): Map<string, Vendor[]> {
  const map = new Map<string, Vendor[]>();
  for (const r of rows) {
    const arr = map.get(r.eventId) ?? [];
    arr.push(mapVendorRow(r));
    map.set(r.eventId, arr);
  }
  return map;
}

export function mapIdeasByEvent(
  rows: readonly (typeof schema.ideaSets.$inferSelect)[]
): Map<string, IdeaSet[]> {
  const map = new Map<string, IdeaSet[]>();
  for (const r of rows) {
    const arr = map.get(r.eventId) ?? [];
    arr.push(mapIdeaSetRow(r));
    map.set(r.eventId, arr);
  }
  return map;
}

export function assembleBatchDetails(
  eventRows: readonly (typeof schema.events.$inferSelect)[],
  budgetRows: readonly (typeof schema.budgetItems.$inferSelect)[],
  timelineRows: readonly (typeof schema.timelineTasks.$inferSelect)[],
  vendorRows: readonly (typeof schema.vendors.$inferSelect)[],
  ideaRows: readonly (typeof schema.ideaSets.$inferSelect)[]
): readonly EventDetails[] {
  const bMap = mapBudgetByEvent(budgetRows);
  const tMap = mapTimelineByEvent(timelineRows);
  const vMap = mapVendorsByEvent(vendorRows);
  const iMap = mapIdeasByEvent(ideaRows);

  return eventRows.map((e) => ({
    event: mapEventRow(e),
    budgetItems: bMap.get(e.id) ?? [],
    timelineTasks: tMap.get(e.id) ?? [],
    vendors: vMap.get(e.id) ?? [],
    ideaSets: iMap.get(e.id) ?? [],
  }));
}

export async function fetchBatchRelationRows(
  db: BetterSQLite3Database<typeof schema>,
  matchedIds: readonly string[]
) {
  return Promise.all([
    db
      .select()
      .from(schema.budgetItems)
      .where(inArray(schema.budgetItems.eventId, [...matchedIds]))
      .all(),
    db
      .select()
      .from(schema.timelineTasks)
      .where(inArray(schema.timelineTasks.eventId, [...matchedIds]))
      .all(),
    db
      .select()
      .from(schema.vendors)
      .where(inArray(schema.vendors.eventId, [...matchedIds]))
      .all(),
    db
      .select()
      .from(schema.ideaSets)
      .where(inArray(schema.ideaSets.eventId, [...matchedIds]))
      .all(),
  ]);
}
