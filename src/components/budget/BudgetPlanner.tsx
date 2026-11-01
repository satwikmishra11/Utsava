'use client';

import React from 'react';
import { BudgetItem, BudgetCategory } from '@/domain/schemas';
import { calculateBudgetSummary, OverspendAnalysis } from '@/domain/budget';
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
import { BudgetScenarioModeler } from './BudgetScenarioModeler';
import { TaxGratuityCalculator } from './TaxGratuityCalculator';
import { WhyThisPlanDisclosure } from '../plan';
import { ProvenanceSource } from '../ui/ProvenanceBadge';

export interface BudgetPlannerProps {
  readonly totalBudget: number;
  readonly currency: string;
  readonly items: readonly BudgetItem[];
  readonly guestCount?: number;
  readonly onAddItem: (item: BudgetItem) => void;
  readonly onRemoveItem: (id: string) => void;
  readonly onUpdateStatus: (id: string) => void;
  readonly onRegenerateAI?: () => void;
  readonly onExportCSV?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly GeneratedBudgetItem[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
  readonly overspendAnalysis?: OverspendAnalysis;
  readonly budgetReasons?: readonly string[];
  readonly timelineReasons?: readonly string[];
  readonly aiSource?: ProvenanceSource;
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
  source,
}: {
  readonly isLoadingAI: boolean;
  readonly hasSuggestions: boolean;
  readonly suggestions?: readonly GeneratedBudgetItem[] | null;
  readonly currency: string;
  readonly onAccept?: () => void;
  readonly onDismiss?: () => void;
  readonly source?: ProvenanceSource;
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
          source={source}
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
  guestCount,
}: {
  readonly totalBudget: number;
  readonly summary: ReturnType<typeof calculateBudgetSummary>;
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly isOver: boolean;
  readonly overspendAnalysis?: OverspendAnalysis;
  readonly guestCount?: number;
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
        guestCount={guestCount}
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

interface BudgetPlannerMainSectionProps {
  readonly props: BudgetPlannerProps;
  readonly summary: ReturnType<typeof calculateBudgetSummary>;
  readonly isOver: boolean;
}

function BudgetFinancialTools({
  props,
}: {
  readonly props: BudgetPlannerProps;
}): React.JSX.Element {
  return (
    <>
      <BudgetScenarioModeler
        totalBudget={props.totalBudget}
        guestCount={props.guestCount ?? 100}
        currency={props.currency}
        items={props.items}
      />
      <TaxGratuityCalculator
        totalBudget={props.totalBudget}
        currency={props.currency}
        items={props.items}
      />
    </>
  );
}

function BudgetPlannerMainSection({
  props,
  summary,
  isOver,
}: BudgetPlannerMainSectionProps): React.JSX.Element {
  return (
    <>
      <WhyThisPlanDisclosure
        id="why-this-plan-budget"
        budgetReasons={props.budgetReasons}
        timelineReasons={props.timelineReasons}
        source={props.aiSource}
      />
      <BudgetPlannerOverview
        totalBudget={props.totalBudget}
        guestCount={props.guestCount}
        summary={summary}
        items={props.items}
        currency={props.currency}
        isOver={isOver}
        overspendAnalysis={props.overspendAnalysis}
      />
      <BudgetFinancialTools props={props} />
      <BudgetAddForm onAdd={(n, cat, c) => props.onAddItem(createBudgetItem(n, cat, c))} />
      <BudgetItemsView
        items={props.items}
        currency={props.currency}
        onUpdateStatus={props.onUpdateStatus}
        onRemoveItem={props.onRemoveItem}
        onRegenerateAI={props.onRegenerateAI}
      />
    </>
  );
}

function BudgetPlannerContent({
  props,
  summary,
  isOver,
  hasSuggestions,
}: {
  readonly props: BudgetPlannerProps;
  readonly summary: ReturnType<typeof calculateBudgetSummary>;
  readonly isOver: boolean;
  readonly hasSuggestions: boolean;
}): React.JSX.Element {
  return (
    <>
      <BudgetPlannerHeader
        onRegenerateAI={props.onRegenerateAI}
        onExportCSV={props.onExportCSV}
        isLoadingAI={props.isLoadingAI}
        source={props.aiSource}
      />
      <BudgetPlannerMainSection props={props} summary={summary} isOver={isOver} />
      <BudgetPlannerAlerts
        isLoadingAI={props.isLoadingAI ?? false}
        hasSuggestions={hasSuggestions}
        suggestions={props.pendingSuggestions}
        currency={props.currency}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
        source={props.aiSource}
      />
    </>
  );
}

export function BudgetPlanner(props: BudgetPlannerProps): React.JSX.Element {
  const summary = calculateBudgetSummary(props.totalBudget, props.items);
  const isOver = props.overspendAnalysis?.isOverspent ?? summary.isOverBudget;
  const hasSuggestions = Boolean(
    props.pendingSuggestions?.length && props.onAcceptSuggestions && props.onDismissSuggestions
  );

  return (
    <section id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="card">
      <BudgetPlannerContent
        props={props}
        summary={summary}
        isOver={isOver}
        hasSuggestions={hasSuggestions}
      />
    </section>
  );
}
