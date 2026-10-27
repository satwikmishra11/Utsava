/**
 * Domain Types for Utsava Event Planning Assistant
 * Strict TypeScript without 'any'
 */

import { BudgetCategory, VendorStatus, EventType, BudgetItem } from './schemas';

export type PaymentStatus = 'planned' | 'booked' | 'paid';

export interface CategoryAllocation {
  readonly category: BudgetCategory;
  readonly allocated: number;
  readonly actual: number;
  readonly percentage: number;
}

export interface BudgetSummary {
  readonly totalBudget: number;
  readonly totalEstimated: number;
  readonly totalActual: number;
  readonly totalPaid: number;
  readonly remainingBudget: number;
  readonly isOverBudget: boolean;
  readonly variance: number;
  readonly categoryAllocations: readonly CategoryAllocation[];
}

export type TimelinePhase = 'preparation' | 'ceremony' | 'reception' | 'teardown';

export interface TimelineItem {
  readonly id: string;
  readonly phase: TimelinePhase;
  readonly title: string;
  readonly time: string;
  readonly durationMinutes: number;
  readonly location?: string;
  readonly completed: boolean;
  readonly assignedTo?: string;
  readonly notes?: string;
  readonly flags?: readonly ('compressed' | 'overdue')[];
  readonly isCompressed?: boolean;
  readonly isOverdue?: boolean;
}

export interface VendorItem {
  readonly id: string;
  readonly category: BudgetCategory;
  readonly name: string;
  readonly contactEmail?: string;
  readonly contactPhone?: string;
  readonly status: VendorStatus;
  readonly quotedAmount: number;
  readonly notes?: string;
  readonly deliverables: readonly string[];
}

export type IdeaCategory = 'theme' | 'decor' | 'entertainment' | 'food_beverage' | 'cultural';

export interface IdeaRecommendation {
  readonly id: string;
  readonly category: IdeaCategory;
  readonly title: string;
  readonly description: string;
  readonly estimatedCostTier: 'low' | 'medium' | 'high';
  readonly culturalContext?: string;
  readonly tags: readonly string[];
}

export interface AddBudgetItemPayload {
  readonly name: string;
  readonly category: BudgetCategory;
  readonly estimatedCost: number;
}

export interface AddTimelineItemPayload {
  readonly title: string;
  readonly timeframe: string;
  readonly assignedTo: string;
}

export interface AddVendorItemPayload {
  readonly category: BudgetCategory;
  readonly role: string;
  readonly estimatedCost: number;
}

export interface AddBudgetItemProposal {
  readonly id: string;
  readonly actionType: 'add_budget_item';
  readonly description: string;
  readonly payload: AddBudgetItemPayload;
  readonly applied: boolean;
}

export interface AddTimelineItemProposal {
  readonly id: string;
  readonly actionType: 'add_timeline_item';
  readonly description: string;
  readonly payload: AddTimelineItemPayload;
  readonly applied: boolean;
}

export interface AddVendorItemProposal {
  readonly id: string;
  readonly actionType: 'add_vendor_item';
  readonly description: string;
  readonly payload: AddVendorItemPayload;
  readonly applied: boolean;
}

export type ActionProposal =
  AddBudgetItemProposal | AddTimelineItemProposal | AddVendorItemProposal;

export type PlanAction =
  | {
      readonly actionType: 'add_budget_item';
      readonly payload: AddBudgetItemPayload;
    }
  | {
      readonly actionType: 'add_timeline_item';
      readonly payload: AddTimelineItemPayload;
    }
  | {
      readonly actionType: 'add_vendor_item';
      readonly payload: AddVendorItemPayload;
    };

export type PlanActionType = PlanAction['actionType'];

export type ActionType =
  PlanActionType | 'update_budget_item' | 'toggle_timeline_item' | 'update_vendor_status';

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: number;
  readonly actionProposal?: ActionProposal;
}

export interface EventPlanSummary {
  readonly id: string;
  readonly title: string;
  readonly eventType: EventType;
  readonly date: string;
  readonly guestCount: number;
  readonly totalBudget: number;
  readonly currency: string;
  readonly culturalContext?: string;
  readonly dietary?: readonly string[];
  readonly accessibilityNeeds?: readonly string[];
}

export interface EventPlan extends EventPlanSummary {
  readonly budgetItems: readonly BudgetItem[];
  readonly timelineItems: readonly TimelineItem[];
  readonly vendors: readonly VendorItem[];
  readonly ideas: readonly IdeaRecommendation[];
  readonly budgetReasons?: readonly string[];
  readonly timelineReasons?: readonly string[];
}
