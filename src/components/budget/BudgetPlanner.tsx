'use client';

import React from 'react';
import { BudgetItem, BudgetCategory } from '@/domain/types';
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

function createBudgetItem(name: string, category: BudgetCategory, cost: number): BudgetItem {
  return {
    id: `budget-${Date.now()}`,
    eventId: 'evt-utsava-main',
    category,
    estimated: cost,
    actual: cost,
    notes: name,
  };
}

function BudgetPlannerAlerts({
  isLoadingAI,
  hasSuggestions,
  suggestions,
  currency,
  onAccept,
  onDismiss,
}: {
  readonly isLoadingAI: boolean;
  readonly hasSuggestions: boolean;
  readonly suggestions?: readonly GeneratedBudgetItem[] | null;
  readonly currency: string;
  readonly onAccept?: () => void;
  readonly onDismiss?: () => void;
}): React.JSX.Element | null {
  return (
    <>
      {isLoadingAI && <CardSkeleton />}
      {hasSuggestions && suggestions && onAccept && onDismiss && (
        <BudgetSuggestionsAlert
          suggestions={suggestions}
          currency={currency}
          onAccept={onAccept}
          onDismiss={onDismiss}
        />
      )}
    </>
  );
}

function BudgetItemsView({
  items,
  currency,
  onUpdateStatus,
  onRemoveItem,
  onRegenerateAI,
}: {
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly onUpdateStatus: (id: string) => void;
  readonly onRemoveItem: (id: string) => void;
  readonly onRegenerateAI?: () => void;
}): React.JSX.Element {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No Budget Items Yet"
        description="Add your first expense manually or click 'Regenerate AI Budget' to auto-allocate."
        actionLabel={onRegenerateAI ? 'Auto-Allocate AI Budget' : undefined}
        onAction={onRegenerateAI}
      />
    );
  }
  return (
    <BudgetTable
      items={items}
      currency={currency}
      onUpdate={onUpdateStatus}
      onRemove={onRemoveItem}
    />
  );
}

function BudgetPlannerOverview({
  totalBudget,
  summary,
  items,
  currency,
  isOver,
  overspendAnalysis,
}: {
  readonly totalBudget: number;
  readonly summary: ReturnType<typeof calculateBudgetSummary>;
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly isOver: boolean;
  readonly overspendAnalysis?: OverspendAnalysis;
}): React.JSX.Element {
  return (
    <>
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
    </>
  );
}

export function BudgetPlanner(props: BudgetPlannerProps): React.JSX.Element {
  const { totalBudget, currency, items, onAddItem } = props;
  const summary = calculateBudgetSummary(totalBudget, items);
  const isOver = props.overspendAnalysis?.isOverspent ?? summary.isOverBudget;
  const hasSuggestions = Boolean(
    props.pendingSuggestions?.length && props.onAcceptSuggestions && props.onDismissSuggestions
  );

  return (
    <section id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="card">
      <BudgetPlannerHeader onRegenerateAI={props.onRegenerateAI} isLoadingAI={props.isLoadingAI} />
      <BudgetPlannerOverview
        totalBudget={totalBudget}
        summary={summary}
        items={items}
        currency={currency}
        isOver={isOver}
        overspendAnalysis={props.overspendAnalysis}
      />
      <BudgetPlannerAlerts
        isLoadingAI={props.isLoadingAI ?? false}
        hasSuggestions={hasSuggestions}
        suggestions={props.pendingSuggestions}
        currency={currency}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
      />
      <BudgetAddForm onAdd={(name, cat, cost) => onAddItem(createBudgetItem(name, cat, cost))} />
      <BudgetItemsView
        items={items}
        currency={currency}
        onUpdateStatus={props.onUpdateStatus}
        onRemoveItem={props.onRemoveItem}
        onRegenerateAI={props.onRegenerateAI}
      />
    </section>
  );
}
