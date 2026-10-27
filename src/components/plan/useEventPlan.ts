'use client';

import { useState } from 'react';
import { EventPlan } from '@/domain/types';
import { EventType } from '@/domain/schemas';
import { invalidateCapabilityCache } from '@/services/ai';
import { useDebouncedAutosave } from './useAutosave';
import { detectOverspend } from '@/domain/budget';
import { WizardData } from '../wizard';
import { TOAST_DURATION_MS } from '@/lib/constants';
import { DEMO_INDIAN_WEDDING, getDemoEventByType } from '@/domain/demo';
import { createPlanFromWizard } from '@/domain/plan';
import { useBudgetAiSync } from './useBudgetAiSync';
import { useTimelineAiSync } from './useTimelineAiSync';
import { useVendorAiSync } from './useVendorAiSync';
import { useIdeaAiSync } from './useIdeaAiSync';
import { useItemMutations } from './useItemMutations';

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

function assembleAiSyncProps(
  budgetAi: ReturnType<typeof useBudgetAiSync>,
  timelineAi: ReturnType<typeof useTimelineAiSync>,
  vendorAi: ReturnType<typeof useVendorAiSync>,
  ideaAi: ReturnType<typeof useIdeaAiSync>
) {
  return {
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
  };
}

function usePlanToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  };
  return { toastMessage, showToast };
}

function useWizardFlow(
  setPlan: (plan: EventPlan) => void,
  showToast: (msg: string) => void,
  budgetAi: ReturnType<typeof useBudgetAiSync>,
  timelineAi: ReturnType<typeof useTimelineAiSync>,
  vendorAi: ReturnType<typeof useVendorAiSync>,
  ideaAi: ReturnType<typeof useIdeaAiSync>
) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const switchEventType = (newType: EventType): void => {
    invalidateCapabilityCache('all');
    setPlan(getDemoEventByType(newType));
  };
  const completeWizard = async (data: WizardData) => {
    const newPlan = createPlanFromWizard(data);
    setPlan(newPlan);
    showToast(`Created plan for ${data.title}! Generating suggestions...`);
    await Promise.all([
      budgetAi.regenerate(newPlan),
      timelineAi.regenerate(newPlan),
      vendorAi.regenerate(newPlan),
      ideaAi.regenerate(newPlan),
    ]);
  };
  return { isWizardOpen, setIsWizardOpen, switchEventType, completeWizard };
}

export function useEventPlan() {
  const [plan, setPlan] = useState<EventPlan>(INITIAL_PLAN);
  const { toastMessage, showToast } = usePlanToast();
  const budgetAi = useBudgetAiSync(plan, setPlan, showToast);
  const timelineAi = useTimelineAiSync(plan, setPlan, showToast);
  const vendorAi = useVendorAiSync(plan, setPlan, showToast);
  const ideaAi = useIdeaAiSync(plan, setPlan, showToast);
  const mutations = useItemMutations(setPlan, plan, showToast);
  const exports = usePlanExports(plan, showToast);
  const autosave = useDebouncedAutosave(plan);
  const wizard = useWizardFlow(setPlan, showToast, budgetAi, timelineAi, vendorAi, ideaAi);

  return {
    plan,
    setPlan,
    ...wizard,
    toastMessage,
    ...assembleAiSyncProps(budgetAi, timelineAi, vendorAi, ideaAi),
    overspendAnalysis: detectOverspend(plan.totalBudget, plan.budgetItems),
    saveStatus: autosave.saveStatus,
    lastSavedAt: autosave.lastSavedAt,
    forceSave: autosave.forceSave,
    ...mutations,
    ...exports,
  };
}
