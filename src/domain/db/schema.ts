import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import type { EventPreferences } from '../schemas';

export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().default('usr_default'),
    type: text('type').notNull(),
    title: text('title').notNull(),
    date: text('date').notNull(),
    guestCount: integer('guest_count').notNull(),
    location: text('location').notNull(),
    totalBudget: real('total_budget').notNull(),
    currency: text('currency').notNull().default('USD'),
    preferences: text('preferences', { mode: 'json' }).$type<EventPreferences>().notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('events_user_id_idx').on(table.userId),
    index('events_type_idx').on(table.type),
    index('events_created_at_idx').on(table.createdAt),
  ]
);

export const budgetItems = sqliteTable(
  'budget_items',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    estimated: real('estimated').notNull(),
    actual: real('actual').notNull().default(0),
    vendorId: text('vendor_id'),
    notes: text('notes'),
  },
  (table) => [
    index('budget_items_event_id_idx').on(table.eventId),
    index('budget_items_category_idx').on(table.category),
  ]
);

export const timelineTasks = sqliteTable(
  'timeline_tasks',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    dueDate: text('due_date').notNull(),
    status: text('status').notNull().default('pending'),
    dependsOn: text('depends_on', { mode: 'json' }).$type<string[]>().notNull(),
    category: text('category').notNull(),
    assignee: text('assignee'),
  },
  (table) => [
    index('timeline_tasks_event_id_idx').on(table.eventId),
    index('timeline_tasks_due_date_idx').on(table.dueDate),
  ]
);

export const vendors = sqliteTable(
  'vendors',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    name: text('name').notNull(),
    contact: text('contact').notNull(),
    quote: real('quote').notNull().default(0),
    status: text('status').notNull().default('shortlisted'),
  },
  (table) => [
    index('vendors_event_id_idx').on(table.eventId),
    index('vendors_status_idx').on(table.status),
  ]
);

export const ideaSets = sqliteTable(
  'idea_sets',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    theme: text('theme').notNull(),
    decor: text('decor', { mode: 'json' }).$type<string[]>().notNull(),
    menu: text('menu', { mode: 'json' }).$type<string[]>().notNull(),
    activities: text('activities', { mode: 'json' }).$type<string[]>().notNull(),
    generatedMetadata: text('generated_metadata', { mode: 'json' })
      .$type<Record<string, unknown>>()
      .notNull(),
  },
  (table) => [index('idea_sets_event_id_idx').on(table.eventId)]
);
