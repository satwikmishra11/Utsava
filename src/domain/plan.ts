import { EventPlan, EventType, TimelineItem } from './types';
import { planTimeline, TaskTemplate, DEFAULT_TIMELINE_TEMPLATES } from './timelineLogic';

export interface WizardPlanInput {
  readonly title: string;
  readonly eventType: EventType;
  readonly date: string;
  readonly guestCount: number;
  readonly totalBudget: number;
  readonly currency: string;
  readonly culture?: string;
  readonly location?: string;
}

export function createPlanWithTimeline(
  data: WizardPlanInput,
  today: string,
  templates: readonly TaskTemplate[] = DEFAULT_TIMELINE_TEMPLATES,
  id?: string
): EventPlan {
  const result = planTimeline(data.date, templates, today);
  const timelineItems: TimelineItem[] = result.tasks.map((t) => ({
    id: t.id,
    phase: 'preparation',
    title: t.title,
    time: t.dueDate,
    durationMinutes: 60,
    completed: false,
    notes: t.category,
    flags: t.flags,
    isCompressed: t.isCompressed,
    isOverdue: t.isOverdue,
  }));

  return {
    id: id ?? `evt-${Date.now()}`,
    title: data.title,
    eventType: data.eventType,
    date: data.date,
    guestCount: data.guestCount,
    totalBudget: data.totalBudget,
    currency: data.currency,
    culturalContext: data.culture,
    budgetItems: [],
    timelineItems,
    vendors: [],
    ideas: [],
  };
}

export function createPlanFromWizard(
  data: WizardPlanInput,
  id?: string,
  today?: string,
  templates?: readonly TaskTemplate[]
): EventPlan {
  if (templates && today) {
    return createPlanWithTimeline(data, today, templates, id);
  }
  return {
    id: id ?? `evt-${Date.now()}`,
    title: data.title,
    eventType: data.eventType,
    date: data.date,
    guestCount: data.guestCount,
    totalBudget: data.totalBudget,
    currency: data.currency,
    culturalContext: data.culture,
    budgetItems: [],
    timelineItems: [],
    vendors: [],
    ideas: [],
  };
}
