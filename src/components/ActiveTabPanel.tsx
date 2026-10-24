'use client';

import React from 'react';
import { TabId } from './NavigationTabs';
import { BudgetPlanner } from './BudgetPlanner';
import { TimelineGenerator } from './TimelineGenerator';
import { VendorChecklist } from './VendorChecklist';
import { IdeaGenerator } from './IdeaGenerator';
import { ChatAssistant } from './ChatAssistant';
import { useEventPlan } from './useEventPlan';

interface ActiveTabPanelProps {
  readonly activeTab: TabId;
  readonly planState: ReturnType<typeof useEventPlan>;
}

export function ActiveTabPanel({ activeTab, planState }: ActiveTabPanelProps): React.JSX.Element {
  const { plan } = planState;

  switch (activeTab) {
    case 'budget':
      return (
        <BudgetPlanner
          totalBudget={plan.totalBudget}
          currency={plan.currency}
          items={plan.budgetItems}
          onAddItem={planState.addBudgetItem}
          onRemoveItem={planState.removeBudgetItem}
          onUpdateStatus={planState.updateBudgetStatus}
        />
      );
    case 'timeline':
      return (
        <TimelineGenerator
          items={plan.timelineItems}
          eventType={plan.eventType}
          onAddItem={planState.addTimelineItem}
          onToggleComplete={planState.toggleTimeline}
          onBulkReplaceTimeline={planState.replaceTimeline}
        />
      );
    case 'vendors':
      return (
        <VendorChecklist
          vendors={plan.vendors}
          currency={plan.currency}
          onAddVendor={planState.addVendor}
          onUpdateStatus={planState.updateVendorStatus}
        />
      );
    case 'ideas':
      return (
        <IdeaGenerator
          eventType={plan.eventType}
          guestCount={plan.guestCount}
          culturalContext={plan.culturalContext}
          ideas={plan.ideas}
          onSaveIdea={planState.saveIdea}
          onBulkAddIdeas={planState.replaceIdeas}
        />
      );
    case 'chat':
      return <ChatAssistant plan={plan} onApplyPlanAction={planState.applyPlanAction} />;
  }
}
