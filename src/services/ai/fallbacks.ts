import { BudgetCategory } from '@/domain/schemas';
import { adviseBudgetSplit } from '@/domain/budgetAdvisor';
import { backScheduleTimeline, TaskTemplate } from '@/domain/timelineLogic';
import { getVendorChecklistTemplates } from '@/domain/vendorTemplates';
import { buildMockIdeas } from '../llm/mockData';
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

export function computeDaysUntilEvent(eventDate?: string, todayStr?: string): number | undefined {
  if (!eventDate) return undefined;
  const today = todayStr ?? new Date().toISOString().slice(0, 10);
  const [ey, em, ed] = eventDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  if (!ey || !em || !ed || !ty || !tm || !td) return undefined;
  const eventTime = Date.UTC(ey, em - 1, ed);
  const todayTime = Date.UTC(ty, tm - 1, td);
  return Math.round((eventTime - todayTime) / 86400000);
}

export function buildFallbackBudgetPlan(
  context: PersonalizationContext,
  todayStr?: string
): GeneratedBudgetPlan {
  const total = context.totalBudget ?? DEFAULT_FALLBACK_BUDGET;
  const currency = context.currency ?? 'INR';
  const daysUntilEvent = computeDaysUntilEvent(context.eventDate, todayStr);

  const advice = adviseBudgetSplit({
    eventType: context.eventType,
    totalBudget: total,
    currency,
    guestCount: context.guestCount,
    dietary: context.dietary,
    accessibilityNeeds: context.accessibilityNeeds,
    culture: context.culture,
    daysUntilEvent,
  });

  const reasonsText =
    advice.reasons.length > 0
      ? advice.reasons.join(' | ').slice(0, 300)
      : `Default allocation for ${context.eventType}`;

  const items = Object.entries(advice.percentages).map(([category, pct]) => ({
    category: category as BudgetCategory,
    estimated: Math.round(((total * pct) / 100) * 100) / 100,
    notes: reasonsText,
  }));

  return {
    items,
    totalAllocated: total,
    currency,
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
