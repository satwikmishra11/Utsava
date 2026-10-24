import { z } from 'zod';

export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community']);
export type EventType = z.infer<typeof EventTypeSchema>;

export const BudgetCategorySchema = z.enum([
  'venue',
  'catering',
  'photography',
  'decor',
  'entertainment',
  'attire',
  'logistics',
  'miscellaneous',
]);
export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;

export const EventPreferencesSchema = z.object({
  culture: z.string().max(100).optional(),
  theme: z.string().max(100).optional(),
  dietary: z.array(z.string().max(60)).default([]),
  accessibilityNeeds: z.array(z.string().max(100)).default([]),
});
export type EventPreferences = z.infer<typeof EventPreferencesSchema>;

export const EventSchema = z.object({
  id: z.string().min(1),
  type: EventTypeSchema,
  title: z.string().min(1).max(150),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  guestCount: z.number().int().positive(),
  location: z.string().min(1).max(200),
  totalBudget: z.number().positive(),
  currency: z.string().min(1).max(5).default('USD'),
  preferences: EventPreferencesSchema.default({ dietary: [], accessibilityNeeds: [] }),
  createdAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
});
export type Event = z.infer<typeof EventSchema>;

export const BudgetItemSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  category: BudgetCategorySchema,
  estimated: z.number().nonnegative(),
  actual: z.number().nonnegative().default(0),
  vendorId: z.string().optional(),
  notes: z.string().max(500).optional(),
});
export type BudgetItem = z.infer<typeof BudgetItemSchema>;

export const TimelineTaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'blocked']);
export type TimelineTaskStatus = z.infer<typeof TimelineTaskStatusSchema>;

export const TimelineTaskSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  title: z.string().min(1).max(150),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  status: TimelineTaskStatusSchema.default('pending'),
  dependsOn: z.array(z.string().min(1)).default([]),
  category: z.string().min(1).max(80),
  assignee: z.string().max(100).optional(),
});
export type TimelineTask = z.infer<typeof TimelineTaskSchema>;

export const VendorStatusSchema = z.enum(['shortlisted', 'booked', 'paid']);
export type VendorStatus = z.infer<typeof VendorStatusSchema>;

export const VendorSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  category: BudgetCategorySchema,
  name: z.string().min(1).max(120),
  contact: z.string().min(1).max(150),
  quote: z.number().nonnegative().default(0),
  status: VendorStatusSchema.default('shortlisted'),
});
export type Vendor = z.infer<typeof VendorSchema>;

export const IdeaSetSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  theme: z.string().min(1).max(120),
  decor: z.array(z.string().min(1).max(150)).default([]),
  menu: z.array(z.string().min(1).max(150)).default([]),
  activities: z.array(z.string().min(1).max(150)).default([]),
  generatedMetadata: z
    .object({
      model: z.string().optional(),
      generatedAt: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .default({}),
});
export type IdeaSet = z.infer<typeof IdeaSetSchema>;
