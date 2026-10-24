import { z } from 'zod';

export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community']);

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

export const PaymentStatusSchema = z.enum(['planned', 'booked', 'paid']);

export const BudgetItemSchema = z.object({
  id: z.string().min(1),
  category: BudgetCategorySchema,
  name: z.string().min(1).max(100),
  estimatedCost: z.number().nonnegative(),
  actualCost: z.number().nonnegative().default(0),
  paidCost: z.number().nonnegative().default(0),
  status: PaymentStatusSchema.default('planned'),
  notes: z.string().max(500).optional(),
});

export const TimelinePhaseSchema = z.enum([
  'preparation',
  'ceremony',
  'reception',
  'teardown',
]);

export const TimelineItemSchema = z.object({
  id: z.string().min(1),
  phase: TimelinePhaseSchema,
  title: z.string().min(1).max(120),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:MM format'),
  durationMinutes: z.number().int().positive().max(1440),
  location: z.string().max(100).optional(),
  completed: z.boolean().default(false),
  assignedTo: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
});

export const VendorStatusSchema = z.enum([
  'researching',
  'contacted',
  'quoted',
  'hired',
  'declined',
]);

export const VendorItemSchema = z.object({
  id: z.string().min(1),
  category: BudgetCategorySchema,
  name: z.string().min(1).max(100),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(25).optional(),
  status: VendorStatusSchema.default('researching'),
  quotedAmount: z.number().nonnegative().default(0),
  notes: z.string().max(500).optional(),
  deliverables: z.array(z.string().min(1).max(100)).default([]),
});

export const IdeaCategorySchema = z.enum([
  'theme',
  'decor',
  'entertainment',
  'food_beverage',
  'cultural',
]);

export const IdeaRecommendationSchema = z.object({
  id: z.string().min(1),
  category: IdeaCategorySchema,
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(600),
  estimatedCostTier: z.enum(['low', 'medium', 'high']),
  culturalContext: z.string().max(200).optional(),
  tags: z.array(z.string().min(1).max(40)),
});

export const EventPlanSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  eventType: EventTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  guestCount: z.number().int().positive(),
  totalBudget: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  culturalContext: z.string().max(300).optional(),
  budgetItems: z.array(BudgetItemSchema).default([]),
  timelineItems: z.array(TimelineItemSchema).default([]),
  vendors: z.array(VendorItemSchema).default([]),
  ideas: z.array(IdeaRecommendationSchema).default([]),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  eventPlan: EventPlanSchema,
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

export const GenerateIdeasRequestSchema = z.object({
  eventType: EventTypeSchema,
  culturalContext: z.string().max(200).optional(),
  budgetTier: z.enum(['budget', 'moderate', 'luxury']).default('moderate'),
  guestCount: z.number().int().positive(),
  existingTags: z.array(z.string()).max(10).default([]),
});

export const GenerateTimelineRequestSchema = z.object({
  eventType: EventTypeSchema,
  eventStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  durationHours: z.number().positive().max(48),
  keyTraditions: z.array(z.string().max(80)).default([]),
});
