import { z } from 'zod';
import {
  EventTypeSchema,
  BudgetCategorySchema,
  TimelineTaskStatusSchema,
  VendorStatusSchema,
} from '@/domain/schemas';

export const PersonalizationContextSchema = z.object({
  eventType: EventTypeSchema,
  culture: z.string().max(100).optional(),
  budgetBand: z.enum(['budget', 'moderate', 'luxury']).default('moderate'),
  totalBudget: z.number().nonnegative().optional(),
  currency: z.string().min(1).max(5).default('USD'),
  guestCount: z.number().int().positive(),
  dietary: z.array(z.string().max(60)).default([]),
  accessibilityNeeds: z.array(z.string().max(100)).default([]),
  location: z.string().max(200).optional(),
  eventDate: z.string().optional(),
});
export type PersonalizationContext = z.infer<typeof PersonalizationContextSchema>;

export const GeneratedBudgetItemSchema = z.object({
  category: BudgetCategorySchema,
  estimated: z.number().nonnegative(),
  notes: z.string().max(300).optional(),
});
export const GeneratedBudgetPlanSchema = z.object({
  items: z.array(GeneratedBudgetItemSchema).min(1),
  totalAllocated: z.number().nonnegative(),
  currency: z.string().min(1).max(5).default('USD'),
});
export type GeneratedBudgetItem = z.infer<typeof GeneratedBudgetItemSchema>;
export type GeneratedBudgetPlan = z.infer<typeof GeneratedBudgetPlanSchema>;

export const GeneratedTimelineTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(150),
  category: z.string().min(1).max(80),
  daysBeforeEvent: z.number().int().nonnegative(),
  dependsOn: z.array(z.string()).default([]),
  assignee: z.string().max(100).optional(),
  dueDate: z.string().optional(),
  status: TimelineTaskStatusSchema.default('pending'),
});
export const GeneratedTimelineSchema = z.object({
  tasks: z.array(GeneratedTimelineTaskSchema).min(1),
});
export type GeneratedTimelineTask = z.infer<typeof GeneratedTimelineTaskSchema>;
export type GeneratedTimeline = z.infer<typeof GeneratedTimelineSchema>;

export const GeneratedVendorItemSchema = z.object({
  category: BudgetCategorySchema,
  name: z.string().min(1).max(120),
  role: z.string().max(120).optional(),
  deliverables: z.array(z.string().max(150)).default([]),
  estimatedQuote: z.number().nonnegative().default(0),
  recommendedLeadWeeks: z.number().int().nonnegative().default(4),
  priority: z.enum(['critical', 'high', 'medium']).default('medium'),
  status: VendorStatusSchema.default('shortlisted'),
});
export const GeneratedVendorChecklistSchema = z.object({
  vendors: z.array(GeneratedVendorItemSchema).min(1),
});
export type GeneratedVendorItem = z.infer<typeof GeneratedVendorItemSchema>;
export type GeneratedVendorChecklist = z.infer<typeof GeneratedVendorChecklistSchema>;

export const GeneratedIdeaRecommendationSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['theme', 'decor', 'entertainment', 'food_beverage', 'cultural']),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  estimatedCostTier: z.enum(['low', 'medium', 'high']),
  culturalContext: z.string().max(100).optional(),
  tags: z.array(z.string().max(40)).default([]),
});
export const GeneratedIdeasSchema = z.object({
  ideas: z.array(GeneratedIdeaRecommendationSchema).min(1),
});
export type GeneratedIdeaRecommendation = z.infer<typeof GeneratedIdeaRecommendationSchema>;
export type GeneratedIdeas = z.infer<typeof GeneratedIdeasSchema>;

export const AddTaskToolCallSchema = z.object({
  tool: z.literal('add_task'),
  parameters: z.object({
    title: z.string().min(1).max(150),
    category: z.string().min(1).max(80),
    daysBeforeEvent: z.number().int().nonnegative().optional(),
    dueDate: z.string().optional(),
    dependsOn: z.array(z.string()).default([]),
  }),
});

export const UpdateBudgetItemToolCallSchema = z.object({
  tool: z.literal('update_budget_item'),
  parameters: z.object({
    category: BudgetCategorySchema,
    estimated: z.number().nonnegative(),
    notes: z.string().max(300).optional(),
  }),
});

export const ShortlistVendorToolCallSchema = z.object({
  tool: z.literal('shortlist_vendor'),
  parameters: z.object({
    name: z.string().min(1).max(120),
    category: BudgetCategorySchema,
    quote: z.number().nonnegative().optional(),
    contact: z.string().max(150).optional(),
  }),
});

export const ToolCallSchema = z.discriminatedUnion('tool', [
  AddTaskToolCallSchema,
  UpdateBudgetItemToolCallSchema,
  ShortlistVendorToolCallSchema,
]);
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ChatAssistantResponseSchema = z.object({
  reply: z.string().min(1),
  toolCalls: z.array(ToolCallSchema).default([]),
});
export type ChatAssistantResponse = z.infer<typeof ChatAssistantResponseSchema>;
