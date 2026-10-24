'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TabId } from './NavigationTabs';
import { BudgetPlanner } from './BudgetPlanner';
import { CardSkeleton } from './ui/Skeleton';
import { useEventPlan } from './useEventPlan';

const TimelineGenerator = dynamic(
  () => import('./TimelineGenerator').then((m) => m.TimelineGenerator),
  { loading: () => <CardSkeleton /> }
);

const VendorChecklist = dynamic(() => import('./VendorChecklist').then((m) => m.VendorChecklist), {
  loading: () => <CardSkeleton />,
});

const IdeaGenerator = dynamic(() => import('./IdeaGenerator').then((m) => m.IdeaGenerator), {
  loading: () => <CardSkeleton />,
});

const ChatAssistant = dynamic(() => import('./ChatAssistant').then((m) => m.ChatAssistant), {
  loading: () => <CardSkeleton />,
});

interface ActiveTabPanelProps {
  readonly activeTab: TabId;
  readonly planState: ReturnType<typeof useEventPlan>;
}

function BudgetTab({
  planState,
}: {
  readonly planState: ReturnType<typeof useEventPlan>;
}): React.JSX.Element {
  const { plan } = planState;
  return (
    <BudgetPlanner
      totalBudget={plan.totalBudget}
      currency={plan.currency}
      items={plan.budgetItems}
      onAddItem={planState.addBudgetItem}
      onRemoveItem={planState.removeBudgetItem}
      onUpdateStatus={planState.updateBudgetStatus}
      onRegenerateAI={() => planState.regenerateBudget(plan)}
      isLoadingAI={planState.loading.budget}
      pendingSuggestions={planState.pendingBudget}
      onAcceptSuggestions={planState.acceptBudgetSuggestions}
      onDismissSuggestions={() => planState.setPendingBudget(null)}
      overspendAnalysis={planState.overspendAnalysis}
    />
  );
}

function TimelineTab({
  planState,
}: {
  readonly planState: ReturnType<typeof useEventPlan>;
}): React.JSX.Element {
  const { plan } = planState;
  return (
    <TimelineGenerator
      items={plan.timelineItems}
      eventType={plan.eventType}
      onAddItem={planState.addTimelineItem}
      onToggleComplete={planState.toggleTimeline}
      onBulkReplaceTimeline={planState.replaceTimeline}
      onRegenerateAI={() => planState.regenerateTimeline(plan)}
      isLoadingAI={planState.loading.timeline}
      pendingSuggestions={planState.pendingTimeline}
      onAcceptSuggestions={planState.acceptTimelineSuggestions}
      onDismissSuggestions={() => planState.setPendingTimeline(null)}
    />
  );
}

function VendorsTab({
  planState,
}: {
  readonly planState: ReturnType<typeof useEventPlan>;
}): React.JSX.Element {
  const { plan } = planState;
  return (
    <VendorChecklist
      vendors={plan.vendors}
      currency={plan.currency}
      onAddVendor={planState.addVendor}
      onUpdateStatus={planState.updateVendorStatus}
      onRegenerateAI={() => planState.regenerateVendors(plan)}
      isLoadingAI={planState.loading.vendors}
      pendingSuggestions={planState.pendingVendors}
      onAcceptSuggestions={planState.acceptVendorSuggestions}
      onDismissSuggestions={() => planState.setPendingVendors(null)}
    />
  );
}

function IdeasTab({
  planState,
}: {
  readonly planState: ReturnType<typeof useEventPlan>;
}): React.JSX.Element {
  const { plan } = planState;
  return (
    <IdeaGenerator
      eventType={plan.eventType}
      guestCount={plan.guestCount}
      culturalContext={plan.culturalContext}
      ideas={plan.ideas}
      onSaveIdea={planState.saveIdea}
      onBulkAddIdeas={planState.replaceIdeas}
      onRegenerateAI={() => planState.regenerateIdeas(plan)}
      isLoadingAI={planState.loading.ideas}
      pendingSuggestions={planState.pendingIdeas}
      onAcceptSuggestions={planState.acceptIdeaSuggestions}
      onDismissSuggestions={() => planState.setPendingIdeas(null)}
    />
  );
}

export function ActiveTabPanel({ activeTab, planState }: ActiveTabPanelProps): React.JSX.Element {
  switch (activeTab) {
    case 'budget':
      return <BudgetTab planState={planState} />;
    case 'timeline':
      return <TimelineTab planState={planState} />;
    case 'vendors':
      return <VendorsTab planState={planState} />;
    case 'ideas':
      return <IdeasTab planState={planState} />;
    case 'chat':
      return <ChatAssistant plan={planState.plan} onApplyPlanAction={planState.applyPlanAction} />;
  }
}
