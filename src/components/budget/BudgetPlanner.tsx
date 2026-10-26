'use client';

import React from 'react';
import { BudgetItem } from '@/domain/types';
import { calculateBudgetSummary } from '@/domain/budget';
import { OverspendAnalysis } from '@/domain/budgetLogic';
import { GeneratedBudgetItem } from '@/services/ai';
import { CardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { BudgetPlannerHeader } from './BudgetPlannerHeader';
import { BudgetSummaryKpis } from './BudgetSummaryKpis';
import { BudgetCategoryBreakdown } from './BudgetCategoryBreakdown';
import { BudgetOverspendAlert } from './BudgetOverspendAlert';
import { BudgetSuggestionsAlert } from './BudgetSuggestionsAlert';
import { BudgetAddForm } from './BudgetAddForm';
import { BudgetTable } from './BudgetTable';

export interface BudgetPlannerProps {
  readonly totalBudget: number;
  readonly currency: string;
  readonly items: readonly BudgetItem[];
  readonly onAddItem: (item: BudgetItem) => void;
  readonly onRemoveItem: (id: string) => void;
  readonly onUpdateStatus: (id: string) => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly GeneratedBudgetItem[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
  readonly overspendAnalysis?: OverspendAnalysis;
}

export function BudgetPlanner(props: BudgetPlannerProps): React.JSX.Element {
  const {
    totalBudget,
    currency,
    items,
    onAddItem,
    onRemoveItem,
    onUpdateStatus,
    onRegenerateAI,
    isLoadingAI = false,
    pendingSuggestions,
    onAcceptSuggestions,
    onDismissSuggestions,
    overspendAnalysis,
  } = props;
  const summary = calculateBudgetSummary(totalBudget, items);
  const isOver = overspendAnalysis?.isOverspent ?? summary.isOverBudget;
  const hasSuggestions = Boolean(
    pendingSuggestions &&
    pendingSuggestions.length > 0 &&
    onAcceptSuggestions &&
    onDismissSuggestions
  );

  return (
    <section id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="card">
      <BudgetPlannerHeader onRegenerateAI={onRegenerateAI} isLoadingAI={isLoadingAI} />
      <BudgetSummaryKpis
        total={totalBudget}
        actual={summary.totalActual}
        paid={summary.totalPaid}
        rem={summary.remainingBudget}
        currency={currency}
        isOver={isOver}
      />
      <BudgetCategoryBreakdown items={items} currency={currency} totalBudget={totalBudget} />
      <BudgetOverspendAlert
        isOver={isOver}
        currency={currency}
        overspendAnalysis={overspendAnalysis}
        totalActual={summary.totalActual}
      />
      {isLoadingAI && <CardSkeleton />}
      {hasSuggestions && pendingSuggestions && onAcceptSuggestions && onDismissSuggestions && (
        <BudgetSuggestionsAlert
          suggestions={pendingSuggestions}
          currency={currency}
          onAccept={onAcceptSuggestions}
          onDismiss={onDismissSuggestions}
        />
      )}
      <BudgetAddForm
        onAdd={(name, category, cost) =>
          onAddItem({
            id: `budget-${Date.now()}`,
            eventId: 'evt-utsava-main',
            category,
            estimated: cost,
            actual: cost,
            notes: name,
          })
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="No Budget Items Yet"
          description="Add your first expense manually or click 'Regenerate AI Budget' to auto-allocate."
          actionLabel={onRegenerateAI ? 'Auto-Allocate AI Budget' : undefined}
          onAction={onRegenerateAI}
        />
      ) : (
        <BudgetTable
          items={items}
          currency={currency}
          onUpdate={onUpdateStatus}
          onRemove={onRemoveItem}
        />
      )}
    </section>
  );
}
