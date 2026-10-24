import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import type { EventPreferences } from '../schemas';

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  guestCount: integer('guest_count').notNull(),
  location: text('location').notNull(),
  totalBudget: real('total_budget').notNull(),
  currency: text('currency').notNull().default('USD'),
  preferences: text('preferences', { mode: 'json' }).$type<EventPreferences>().notNull(),
  createdAt: text('created_at').notNull(),
});

export const budgetItems = sqliteTable('budget_items', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  estimated: real('estimated').notNull(),
  actual: real('actual').notNull().default(0),
  vendorId: text('vendor_id'),
  notes: text('notes'),
});

export const timelineTasks = sqliteTable('timeline_tasks', {
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
});

export const vendors = sqliteTable('vendors', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  name: text('name').notNull(),
  contact: text('contact').notNull(),
  quote: real('quote').notNull().default(0),
  status: text('status').notNull().default('shortlisted'),
});

export const ideaSets = sqliteTable('idea_sets', {
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
});
