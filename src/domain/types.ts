/**
 * Domain Types for Utsava Event Planning Assistant
 * Strict TypeScript without 'any'
 */

export type EventType = 'wedding' | 'birthday' | 'community';

export type BudgetCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'decor'
  | 'entertainment'
  | 'attire'
  | 'logistics'
  | 'miscellaneous';

export type PaymentStatus = 'planned' | 'booked' | 'paid';

export interface BudgetItem {
  readonly id: string;
  readonly category: BudgetCategory;
  readonly name: string;
  readonly estimatedCost: number;
  readonly actualCost: number;
  readonly paidCost: number;
  readonly status: PaymentStatus;
  readonly notes?: string;
}

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
  readonly time: string; // e.g. "14:00" or ISO time
  readonly durationMinutes: number;
  readonly location?: string;
  readonly completed: boolean;
  readonly assignedTo?: string;
  readonly notes?: string;
}

export type VendorStatus = 'researching' | 'contacted' | 'quoted' | 'hired' | 'declined';

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

export type ActionType =
  | 'add_budget_item'
  | 'update_budget_item'
  | 'add_timeline_item'
  | 'toggle_timeline_item'
  | 'add_vendor_item'
  | 'update_vendor_status';

export interface ActionProposal {
  readonly id: string;
  readonly actionType: ActionType;
  readonly description: string;
  readonly payload: Record<string, string | number | boolean>;
  readonly applied: boolean;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: number;
  readonly actionProposal?: ActionProposal;
}

export interface EventPlan {
  readonly id: string;
  readonly title: string;
  readonly eventType: EventType;
  readonly date: string;
  readonly guestCount: number;
  readonly totalBudget: number;
  readonly currency: string;
  readonly culturalContext?: string;
  readonly budgetItems: readonly BudgetItem[];
  readonly timelineItems: readonly TimelineItem[];
  readonly vendors: readonly VendorItem[];
  readonly ideas: readonly IdeaRecommendation[];
}
