import { EventPlan } from './types';
import { adviseBudgetSplit } from './budget';
import { planTimeline, DEFAULT_TIMELINE_TEMPLATES, computeDaysBetween } from './timeline';

export interface PlanReasonsResult {
  readonly budgetReasons: readonly string[];
  readonly timelineReasons: readonly string[];
  readonly allReasons: readonly string[];
}

function resolveDaysUntil(eventDate: string, today: string): number | undefined {
  try {
    return computeDaysBetween(eventDate, today);
  } catch {
    return undefined;
  }
}

function resolveBudgetReasons(
  plan: EventPlan,
  daysUntilEvent: number | undefined
): readonly string[] {
  if (plan.budgetReasons && plan.budgetReasons.length > 0) {
    return plan.budgetReasons;
  }
  const advice = adviseBudgetSplit({
    eventType: plan.eventType,
    totalBudget: plan.totalBudget,
    currency: plan.currency,
    guestCount: plan.guestCount,
    dietary: plan.dietary ?? [],
    accessibilityNeeds: plan.accessibilityNeeds ?? [],
    culture: plan.culturalContext,
    daysUntilEvent,
  });
  return advice.reasons;
}

function resolveTimelineReasons(plan: EventPlan, today: string): readonly string[] {
  if (plan.timelineReasons && plan.timelineReasons.length > 0) {
    return plan.timelineReasons;
  }
  try {
    return planTimeline(plan.date, DEFAULT_TIMELINE_TEMPLATES, today).reasons;
  } catch {
    return [];
  }
}

export function getPlanReasons(plan: EventPlan, today = '2026-10-26'): PlanReasonsResult {
  const daysUntil = resolveDaysUntil(plan.date, today);
  const budgetReasons = resolveBudgetReasons(plan, daysUntil);
  const timelineReasons = resolveTimelineReasons(plan, today);

  return {
    budgetReasons,
    timelineReasons,
    allReasons: [...budgetReasons, ...timelineReasons],
  };
}
