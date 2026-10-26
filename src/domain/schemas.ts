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
  currency: z.string().min(1).max(5).default('INR'),
  preferences: EventPreferencesSchema.default({ dietary: [], accessibilityNeeds: [] }),
  userId: z.string().min(1).default('usr_default'),
  createdAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
});
export type Event = z.infer<typeof EventSchema>;

export const CreateEventSchema = EventSchema.omit({ createdAt: true }).extend({
  id: z.string().min(1).optional(),
});
export type CreateEvent = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = EventSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;

export const ListEventsQuerySchema = z.object({
  type: EventTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
});
export type ListEventsQuery = z.infer<typeof ListEventsQuerySchema>;

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

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  eventPlan: z
    .object({
      id: z.string(),
      title: z.string(),
      eventType: EventTypeSchema,
      date: z.string(),
      guestCount: z.number(),
      totalBudget: z.number(),
      currency: z.string(),
    })
    .passthrough(),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(2000),
      })
    )
    .max(20)
    .default([]),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const GenerateIdeasRequestSchema = z.object({
  eventType: EventTypeSchema,
  culturalContext: z.string().max(500).optional(),
  budgetTier: z.enum(['budget', 'moderate', 'luxury']).default('moderate'),
  guestCount: z.number().int().positive(),
  existingTags: z.array(z.string()).max(10).default([]),
});
export type GenerateIdeasRequest = z.infer<typeof GenerateIdeasRequestSchema>;

export const GenerateTimelineRequestSchema = z.object({
  eventType: EventTypeSchema,
  eventStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .default('09:00'),
  durationHours: z.number().positive().max(48).default(6),
  keyTraditions: z.array(z.string().max(80)).default([]),
  guestCount: z.number().int().positive().optional(),
  culture: z.string().max(100).optional(),
  culturalContext: z.string().max(500).optional(),
  eventDate: z.string().optional(),
  location: z.string().max(200).optional(),
  budgetBand: z.enum(['budget', 'moderate', 'luxury']).optional(),
  totalBudget: z.number().nonnegative().optional(),
  currency: z.string().min(1).max(5).optional(),
  dietary: z.array(z.string().max(60)).default([]),
  accessibilityNeeds: z.array(z.string().max(100)).default([]),
});
export type GenerateTimelineRequest = z.infer<typeof GenerateTimelineRequestSchema>;
