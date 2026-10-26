import { BudgetCategory } from '@/domain/schemas';
import { allocateBudget } from '@/domain/budgetLogic';
import { backScheduleTimeline, TaskTemplate } from '@/domain/timelineLogic';
import { getVendorChecklistTemplates } from '@/domain/vendorTemplates';
import { buildMockIdeas } from '../aiService';
import {
  PersonalizationContext,
  GeneratedBudgetPlan,
  GeneratedTimeline,
  GeneratedVendorChecklist,
  GeneratedIdeas,
} from './types';
import { DEFAULT_FALLBACK_BUDGET } from '@/lib/constants';

const DEFAULT_TIMELINE_TEMPLATES: readonly TaskTemplate[] = [
  {
    id: 't-1',
    title: 'Secure Event Venue',
    category: 'venue',
    daysBeforeEvent: 180,
    dependsOn: [],
  },
  {
    id: 't-2',
    title: 'Confirm Catering Menu',
    category: 'catering',
    daysBeforeEvent: 90,
    dependsOn: ['t-1'],
  },
  {
    id: 't-3',
    title: 'Contract Photographer',
    category: 'photography',
    daysBeforeEvent: 60,
    dependsOn: ['t-1'],
  },
  {
    id: 't-4',
    title: 'Finalize Decor & Theme',
    category: 'decor',
    daysBeforeEvent: 30,
    dependsOn: ['t-1'],
  },
  {
    id: 't-5',
    title: 'Send Guest RSVPs',
    category: 'logistics',
    daysBeforeEvent: 14,
    dependsOn: ['t-2'],
  },
];

export function buildFallbackBudgetPlan(context: PersonalizationContext): GeneratedBudgetPlan {
  const total = context.totalBudget ?? DEFAULT_FALLBACK_BUDGET;
  const allocations = allocateBudget(context.eventType, total);
  const items = Object.entries(allocations).map(([category, estimated]) => ({
    category: category as BudgetCategory,
    estimated,
    notes: `Default allocation for ${context.eventType}`,
  }));
  return {
    items,
    totalAllocated: total,
    currency: context.currency ?? 'INR',
  };
}

export function buildFallbackTimeline(context: PersonalizationContext): GeneratedTimeline {
  const eventDate = context.eventDate ?? '2026-12-31';
  const scheduled = backScheduleTimeline(eventDate, DEFAULT_TIMELINE_TEMPLATES);
  return {
    tasks: scheduled.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      daysBeforeEvent: s.daysBeforeEvent,
      dependsOn: [...s.dependsOn],
      dueDate: s.dueDate,
      status: 'pending',
    })),
  };
}

export function buildFallbackVendorChecklist(
  context: PersonalizationContext
): GeneratedVendorChecklist {
  const templates = getVendorChecklistTemplates(context.eventType);
  return {
    vendors: templates.map((t) => ({
      category: t.category,
      name: t.role,
      role: t.role,
      deliverables: [...t.deliverables],
      estimatedQuote: 0,
      recommendedLeadWeeks: t.recommendedLeadWeeks,
      priority: t.priority,
      status: 'shortlisted',
    })),
  };
}

export function buildFallbackIdeas(context: PersonalizationContext): GeneratedIdeas {
  const ideas = buildMockIdeas(context.eventType, context.culture);
  return {
    ideas: ideas.map((i) => ({
      id: i.id,
      category: i.category,
      title: i.title,
      description: i.description,
      estimatedCostTier: i.estimatedCostTier,
      culturalContext: i.culturalContext,
      tags: [...i.tags],
    })),
  };
}
