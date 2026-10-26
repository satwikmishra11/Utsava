import { EventPlan, EventType } from './types';

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

export function createPlanFromWizard(data: WizardPlanInput, id?: string): EventPlan {
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
