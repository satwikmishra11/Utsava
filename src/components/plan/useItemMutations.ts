import {
  EventPlan,
  BudgetItem,
  TimelineItem,
  VendorItem,
  IdeaRecommendation,
  VendorStatus,
  BudgetCategory,
  PlanAction,
  PlanActionType,
} from '@/domain/types';
import { FALLBACK_EXPENSE_ESTIMATE, FALLBACK_EXPENSE_ESTIMATE_VENDOR } from '@/lib/constants';

interface PlanActionApplierMutations {
  readonly addBudgetItem: (item: BudgetItem) => void;
  readonly addTimelineItem: (item: TimelineItem) => void;
  readonly addVendor: (item: VendorItem) => void;
}

function handleAddBudgetItemAction(
  payload: Record<string, unknown>,
  planId: string,
  addBudgetItem: (item: BudgetItem) => void,
  showToast: (msg: string) => void
): void {
  addBudgetItem({
    id: `budget-auto-${Date.now()}`,
    eventId: planId,
    category: (payload.category as BudgetCategory) || 'miscellaneous',
    estimated: Number(payload.estimatedCost) || FALLBACK_EXPENSE_ESTIMATE,
    actual: Number(payload.estimatedCost) || FALLBACK_EXPENSE_ESTIMATE,
    notes: String(payload.name ?? 'Contingency Allocation'),
  });
  showToast('Applied assistant action: Added contingency budget item.');
}

function handleAddTimelineItemAction(
  payload: Record<string, unknown>,
  addTimelineItem: (item: TimelineItem) => void,
  showToast: (msg: string) => void
): void {
  addTimelineItem({
    id: `timeline-auto-${Date.now()}`,
    phase: 'preparation',
    title: String(payload.title ?? 'Review event milestones & logistics'),
    time: '09:00',
    durationMinutes: 60,
    completed: false,
    assignedTo: String(payload.assignedTo ?? 'Event Organizer'),
    notes: typeof payload.timeframe === 'string' ? `Timeframe: ${payload.timeframe}` : undefined,
  });
  showToast('Applied assistant action: Added timeline milestone.');
}

function handleAddVendorItemAction(
  payload: Record<string, unknown>,
  addVendor: (item: VendorItem) => void,
  showToast: (msg: string) => void
): void {
  addVendor({
    id: `vendor-auto-${Date.now()}`,
    category: (payload.category as BudgetCategory) || 'catering',
    name: String(payload.role ?? 'Premium Service Provider'),
    status: 'shortlisted',
    quotedAmount: Number(payload.estimatedCost) || FALLBACK_EXPENSE_ESTIMATE_VENDOR,
    deliverables: ['Custom consultation & planning'],
    notes: 'Added from AI chat suggestion',
  });
  showToast('Applied assistant action: Added vendor requirement.');
}

function applyActionToPlan(
  actionType: string,
  rawPayload: PlanAction['payload'] | Record<string, unknown>,
  planId: string,
  mutations: PlanActionApplierMutations,
  showToast: (msg: string) => void
): void {
  const payload = rawPayload as unknown as Record<string, unknown>;
  if (actionType === 'add_budget_item') {
    handleAddBudgetItemAction(payload, planId, mutations.addBudgetItem, showToast);
  } else if (actionType === 'add_timeline_item') {
    handleAddTimelineItemAction(payload, mutations.addTimelineItem, showToast);
  } else if (actionType === 'add_vendor_item') {
    handleAddVendorItemAction(payload, mutations.addVendor, showToast);
  }
}

function useBudgetMutations(setPlan: React.Dispatch<React.SetStateAction<EventPlan>>) {
  const addBudgetItem = (item: BudgetItem) =>
    setPlan((p) => ({ ...p, budgetItems: [...p.budgetItems, item] }));
  const removeBudgetItem = (id: string) =>
    setPlan((p) => ({ ...p, budgetItems: p.budgetItems.filter((i) => i.id !== id) }));
  const updateBudgetStatus = (id: string) =>
    setPlan((p) => ({
      ...p,
      budgetItems: p.budgetItems.map((i) =>
        i.id === id ? { ...i, actual: i.actual > 0 ? 0 : i.estimated } : i
      ),
    }));
  return { addBudgetItem, removeBudgetItem, updateBudgetStatus };
}

function useTimelineMutations(setPlan: React.Dispatch<React.SetStateAction<EventPlan>>) {
  const addTimelineItem = (item: TimelineItem) =>
    setPlan((p) => ({
      ...p,
      timelineItems: [...p.timelineItems, item].sort((a, b) => a.time.localeCompare(b.time)),
    }));
  const toggleTimeline = (id: string) =>
    setPlan((p) => ({
      ...p,
      timelineItems: p.timelineItems.map((i) =>
        i.id === id ? { ...i, completed: !i.completed } : i
      ),
    }));
  const replaceTimeline = (items: readonly TimelineItem[]) =>
    setPlan((p) => ({ ...p, timelineItems: items }));
  return { addTimelineItem, toggleTimeline, replaceTimeline };
}

function useVendorAndIdeaMutations(setPlan: React.Dispatch<React.SetStateAction<EventPlan>>) {
  const addVendor = (v: VendorItem) => setPlan((p) => ({ ...p, vendors: [...p.vendors, v] }));
  const updateVendorStatus = (id: string, status: VendorStatus) =>
    setPlan((p) => ({
      ...p,
      vendors: p.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
    }));
  const saveIdea = (idea: IdeaRecommendation) =>
    setPlan((p) => ({ ...p, ideas: [...p.ideas, idea] }));
  const replaceIdeas = (ideas: readonly IdeaRecommendation[]) => setPlan((p) => ({ ...p, ideas }));
  return { addVendor, updateVendorStatus, saveIdea, replaceIdeas };
}

export function useItemMutations(
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  plan: EventPlan,
  showToast: (m: string) => void
) {
  const budgetMutations = useBudgetMutations(setPlan);
  const timelineMutations = useTimelineMutations(setPlan);
  const vendorAndIdeaMutations = useVendorAndIdeaMutations(setPlan);

  const applyPlanAction = (
    actionOrType: PlanAction | PlanActionType | string,
    maybePayload?: PlanAction['payload'] | Record<string, unknown>
  ) => {
    const actionType = typeof actionOrType === 'object' ? actionOrType.actionType : actionOrType;
    const payload = typeof actionOrType === 'object' ? actionOrType.payload : (maybePayload ?? {});
    applyActionToPlan(
      actionType,
      payload,
      plan.id,
      {
        addBudgetItem: budgetMutations.addBudgetItem,
        addTimelineItem: timelineMutations.addTimelineItem,
        addVendor: vendorAndIdeaMutations.addVendor,
      },
      showToast
    );
  };

  return {
    ...budgetMutations,
    ...timelineMutations,
    ...vendorAndIdeaMutations,
    applyPlanAction,
  };
}
