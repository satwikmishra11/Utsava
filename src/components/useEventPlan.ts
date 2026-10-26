'use client';

import { useState } from 'react';
import {
  EventPlan,
  EventType,
  BudgetItem,
  TimelineItem,
  VendorItem,
  IdeaRecommendation,
  VendorStatus,
} from '@/domain/types';
import {
  generateBudgetPlan,
  generateTimeline,
  generateVendorChecklist,
  generateIdeas,
  invalidateCapabilityCache,
  GeneratedBudgetItem,
  GeneratedTimelineTask,
  GeneratedVendorItem,
} from '@/services/ai';
import { useDebouncedAutosave } from './useAutosave';
import { detectOverspend } from '@/domain/budgetLogic';
import { WizardData } from './OnboardingWizard';
import { TOAST_DURATION_MS, FALLBACK_EXPENSE_ESTIMATE } from '@/lib/constants';
import { DEMO_INDIAN_WEDDING, getDemoEventByType } from '@/domain/demoEvents';

export const INITIAL_PLAN: EventPlan = DEMO_INDIAN_WEDDING;

export function usePlanExports(plan: EventPlan, showToast: (msg: string) => void) {
  const handleExportICS = async () => {
    const { exportPlanToICS } = await import('@/lib/exportUtils');
    exportPlanToICS(plan);
    showToast('Downloaded timeline calendar (.ics) file.');
  };
  const handleExportPDF = async () => {
    const { exportPlanToPrintablePDF } = await import('@/lib/exportUtils');
    exportPlanToPrintablePDF();
  };
  const handleShareLink = async () => {
    const { generateShareableLink, copyToClipboard } = await import('@/lib/exportUtils');
    const link = generateShareableLink(plan);
    const success = await copyToClipboard(link);
    showToast(success ? 'Shareable link copied to clipboard!' : 'Unable to copy link.');
  };
  return { handleExportICS, handleExportPDF, handleShareLink };
}

function useBudgetAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly GeneratedBudgetItem[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateBudgetPlan({
      eventType: target.eventType,
      guestCount: target.guestCount,
      totalBudget: target.totalBudget,
      currency: target.currency,
      culture: target.culturalContext,
    });
    setPending(res.data.items);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    const items: BudgetItem[] = pending.map((b, idx) => ({
      id: `b-ai-${Date.now()}-${idx}`,
      eventId: plan.id,
      category: b.category,
      estimated: b.estimated,
      actual: 0,
      notes: b.notes,
    }));
    setPlan((prev) => ({ ...prev, budgetItems: items }));
    setPending(null);
    showToast('Applied AI Budget Allocation to your plan.');
  };

  return { loading, pending, setPending, regenerate, accept };
}

function useTimelineAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly GeneratedTimelineTask[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateTimeline({
      eventType: target.eventType,
      guestCount: target.guestCount,
      eventDate: target.date,
      culture: target.culturalContext,
    });
    setPending(res.data.tasks);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    const items: TimelineItem[] = pending.map((t) => ({
      id: t.id,
      phase: 'preparation',
      title: t.title,
      time: t.dueDate ?? plan.date,
      durationMinutes: 60,
      completed: false,
      notes: t.category,
    }));
    setPlan((prev) => ({ ...prev, timelineItems: items }));
    setPending(null);
    showToast('Applied AI Timeline tasks to your schedule.');
  };

  return { loading, pending, setPending, regenerate, accept };
}

function useVendorAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly GeneratedVendorItem[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateVendorChecklist({
      eventType: target.eventType,
      guestCount: target.guestCount,
      totalBudget: target.totalBudget,
      currency: target.currency,
      culture: target.culturalContext,
    });
    setPending(res.data.vendors);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    const vendors: VendorItem[] = pending.map((v, idx) => ({
      id: `v-ai-${Date.now()}-${idx}`,
      category: v.category,
      name: v.name,
      status: v.status,
      quotedAmount: v.estimatedQuote,
      deliverables: [...v.deliverables],
      notes: v.role,
    }));
    setPlan((prev) => ({ ...prev, vendors: [...prev.vendors, ...vendors] }));
    setPending(null);
    showToast('Added AI Recommended Vendors to your checklist.');
  };

  return { loading, pending, setPending, regenerate, accept };
}

function useIdeaAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly IdeaRecommendation[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateIdeas({
      eventType: target.eventType,
      guestCount: target.guestCount,
      culture: target.culturalContext,
    });
    setPending(res.data.ideas);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    setPlan((prev) => ({ ...prev, ideas: [...prev.ideas, ...pending] }));
    setPending(null);
    showToast('Saved AI creative recommendations to your gallery.');
  };

  return { loading, pending, setPending, regenerate, accept };
}

function useItemMutations(
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  plan: EventPlan,
  showToast: (m: string) => void
) {
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
  const addVendor = (v: VendorItem) => setPlan((p) => ({ ...p, vendors: [...p.vendors, v] }));
  const updateVendorStatus = (id: string, status: VendorStatus) =>
    setPlan((p) => ({
      ...p,
      vendors: p.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
    }));
  const saveIdea = (idea: IdeaRecommendation) =>
    setPlan((p) => ({ ...p, ideas: [...p.ideas, idea] }));
  const replaceIdeas = (ideas: readonly IdeaRecommendation[]) => setPlan((p) => ({ ...p, ideas }));
  const applyPlanAction = (actionType: string, payload: Record<string, unknown>) => {
    if (actionType === 'add_budget_item') {
      addBudgetItem({
        id: `budget-auto-${Date.now()}`,
        eventId: plan.id,
        category: 'miscellaneous',
        estimated: Number(payload.estimatedCost) || FALLBACK_EXPENSE_ESTIMATE,
        actual: Number(payload.estimatedCost) || FALLBACK_EXPENSE_ESTIMATE,
        notes: String(payload.name ?? 'Contingency Allocation'),
      });
      showToast('Applied assistant action: Added contingency budget item.');
    }
  };
  return {
    addBudgetItem,
    removeBudgetItem,
    updateBudgetStatus,
    addTimelineItem,
    toggleTimeline,
    replaceTimeline,
    addVendor,
    updateVendorStatus,
    saveIdea,
    replaceIdeas,
    applyPlanAction,
  };
}

export function useEventPlan() {
  const [plan, setPlan] = useState<EventPlan>(INITIAL_PLAN);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  };

  const budgetAi = useBudgetAiSync(plan, setPlan, showToast);
  const timelineAi = useTimelineAiSync(plan, setPlan, showToast);
  const vendorAi = useVendorAiSync(plan, setPlan, showToast);
  const ideaAi = useIdeaAiSync(plan, setPlan, showToast);
  const mutations = useItemMutations(setPlan, plan, showToast);
  const exports = usePlanExports(plan, showToast);
  const autosave = useDebouncedAutosave(plan);

  const switchEventType = (newType: EventType): void => {
    invalidateCapabilityCache('all');
    setPlan(getDemoEventByType(newType));
  };

  const completeWizard = async (data: WizardData) => {
    const newPlan: EventPlan = {
      id: `evt-${Date.now()}`,
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
    setPlan(newPlan);
    showToast(`Created plan for ${data.title}! Generating suggestions...`);
    await Promise.all([
      budgetAi.regenerate(newPlan),
      timelineAi.regenerate(newPlan),
      vendorAi.regenerate(newPlan),
      ideaAi.regenerate(newPlan),
    ]);
  };

  return {
    plan,
    setPlan,
    isWizardOpen,
    setIsWizardOpen,
    toastMessage,
    switchEventType,
    completeWizard,
    loading: {
      budget: budgetAi.loading,
      timeline: timelineAi.loading,
      vendors: vendorAi.loading,
      ideas: ideaAi.loading,
    },
    pendingBudget: budgetAi.pending,
    setPendingBudget: budgetAi.setPending,
    regenerateBudget: budgetAi.regenerate,
    acceptBudgetSuggestions: budgetAi.accept,
    pendingTimeline: timelineAi.pending,
    setPendingTimeline: timelineAi.setPending,
    regenerateTimeline: timelineAi.regenerate,
    acceptTimelineSuggestions: timelineAi.accept,
    pendingVendors: vendorAi.pending,
    setPendingVendors: vendorAi.setPending,
    regenerateVendors: vendorAi.regenerate,
    acceptVendorSuggestions: vendorAi.accept,
    pendingIdeas: ideaAi.pending,
    setPendingIdeas: ideaAi.setPending,
    regenerateIdeas: ideaAi.regenerate,
    acceptIdeaSuggestions: ideaAi.accept,
    overspendAnalysis: detectOverspend(plan.totalBudget, plan.budgetItems),
    saveStatus: autosave.saveStatus,
    lastSavedAt: autosave.lastSavedAt,
    forceSave: autosave.forceSave,
    ...mutations,
    ...exports,
  };
}
