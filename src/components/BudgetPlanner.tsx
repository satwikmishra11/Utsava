'use client';

import React, { useState } from 'react';
import { BudgetItem, BudgetCategory } from '@/domain/types';
import { calculateBudgetSummary, ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { OverspendAnalysis } from '@/domain/budgetLogic';
import { GeneratedBudgetItem } from '@/services/ai';
import { Plus, Trash2, AlertTriangle, CheckCircle2, Sparkles, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { CardSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';

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

function BudgetSummaryKpis({
  total,
  actual,
  paid,
  rem,
  currency,
  isOver,
}: {
  readonly total: number;
  readonly actual: number;
  readonly paid: number;
  readonly rem: number;
  readonly currency: string;
  readonly isOver: boolean;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Total Target Budget
        </span>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
          {currency} {total.toLocaleString()}
        </p>
      </div>
      <div
        style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Committed Expenses
        </span>
        <p
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            marginTop: '4px',
            color: isOver ? 'var(--accent-rose)' : 'var(--text-primary)',
          }}
        >
          {currency} {actual.toLocaleString()}
        </p>
      </div>
      <div
        style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paid to Date</span>
        <p
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            marginTop: '4px',
            color: 'var(--accent-emerald)',
          }}
        >
          {currency} {paid.toLocaleString()}
        </p>
      </div>
      <div
        style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Remaining Balance
        </span>
        <p
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            marginTop: '4px',
            color: isOver ? 'var(--accent-rose)' : 'var(--accent-gold)',
          }}
        >
          {currency} {rem.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function BudgetSuggestionsAlert({
  suggestions,
  currency,
  onAccept,
  onDismiss,
}: {
  readonly suggestions: readonly GeneratedBudgetItem[];
  readonly currency: string;
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
}): React.JSX.Element {
  const sum = suggestions.reduce((acc, s) => acc + s.estimated, 0);
  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--accent-gold)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
            ✨ AI Budget Suggestions Ready
          </span>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }}>
            {suggestions.length} allocations proposed totaling {currency} {sum.toLocaleString()}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={onAccept}
            size="sm"
            variant="primary"
            leftIcon={<Check size={14} />}
            id="btn-accept-budget-ai"
          >
            Accept Suggestions
          </Button>
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            leftIcon={<X size={14} />}
            id="btn-dismiss-budget-ai"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}

function BudgetAddForm({
  onAdd,
}: {
  readonly onAdd: (name: string, category: BudgetCategory, cost: number) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('venue');
  const [cost, setCost] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(cost) <= 0) return;
    onAdd(name.trim(), category, Number(cost));
    setName('');
    setCost('');
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
        gap: '12px',
        alignItems: 'flex-end',
        marginBottom: '24px',
      }}
    >
      <div>
        <label htmlFor="budget-name" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Expense Title
        </label>
        <input
          id="budget-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Venue Deposit"
          required
        />
      </div>
      <div>
        <label htmlFor="budget-cat" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Category
        </label>
        <select
          id="budget-cat"
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value as BudgetCategory)}
        >
          {ALL_BUDGET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="budget-cost" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Amount
        </label>
        <input
          id="budget-cost"
          type="number"
          min="1"
          className="input"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="1000"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" id="btn-add-budget-item">
        <Plus size={16} aria-hidden="true" />
        <span>Add Expense</span>
      </button>
    </form>
  );
}

function BudgetTableRow({
  item,
  currency,
  onUpdate,
  onRemove,
}: {
  readonly item: BudgetItem;
  readonly currency: string;
  readonly onUpdate: (id: string) => void;
  readonly onRemove: (id: string) => void;
}): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{item.notes ?? item.id}</td>
      <td style={{ padding: '12px 8px' }}>
        <span className="badge badge-gold">{item.category}</span>
      </td>
      <td style={{ padding: '12px 8px' }}>
        {currency} {item.estimated.toLocaleString()}
      </td>
      <td style={{ padding: '12px 8px' }}>
        <button
          onClick={() => onUpdate(item.id)}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
          aria-label={`Toggle payment status for ${item.notes ?? item.id}`}
        >
          {item.actual > 0 ? (
            <span
              style={{
                color: 'var(--accent-emerald)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={14} aria-hidden="true" /> Paid
            </span>
          ) : (
            'planned'
          )}
        </button>
      </td>
      <td style={{ padding: '12px 8px' }}>
        <button
          onClick={() => onRemove(item.id)}
          className="btn btn-secondary"
          style={{ padding: '6px', color: 'var(--accent-rose)' }}
          aria-label={`Delete ${item.notes ?? item.id}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

function BudgetTable({
  items,
  currency,
  onUpdate,
  onRemove,
}: {
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly onUpdate: (id: string) => void;
  readonly onRemove: (id: string) => void;
}): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.925rem',
        }}
      >
        <caption className="sr-only">Budget Expenses List</caption>
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <th style={{ padding: '12px 8px' }} scope="col">
              Expense
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Category
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Estimated
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Status
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <BudgetTableRow
              key={item.id}
              item={item}
              currency={currency}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BudgetOverspendAlert({
  isOver,
  currency,
  overspendAnalysis,
  totalActual,
}: {
  readonly isOver: boolean;
  readonly currency: string;
  readonly overspendAnalysis?: OverspendAnalysis;
  readonly totalActual: number;
}): React.JSX.Element | null {
  if (!isOver) return null;
  return (
    <div
      role="alert"
      style={{
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid var(--accent-rose)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--accent-rose)',
          fontWeight: 600,
        }}
      >
        <AlertTriangle size={18} aria-hidden="true" />
        <span>Overspend Alert</span>
      </div>
      <p style={{ marginTop: '4px', fontSize: '0.875rem', color: '#fca5a5' }}>
        Total expenses exceed target budget by {overspendAnalysis?.overspentPercentage ?? 0}% (
        {currency} {(overspendAnalysis?.totalSpent ?? totalActual).toLocaleString()}).
      </p>
    </div>
  );
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

  return (
    <section id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Event Budget & Cost Allocation</h2>
        {onRegenerateAI && (
          <Button
            onClick={onRegenerateAI}
            isLoading={isLoadingAI}
            variant="outline"
            size="sm"
            leftIcon={<Sparkles size={16} />}
            id="btn-regenerate-budget"
          >
            Regenerate AI Budget
          </Button>
        )}
      </div>
      <BudgetSummaryKpis
        total={totalBudget}
        actual={summary.totalActual}
        paid={summary.totalPaid}
        rem={summary.remainingBudget}
        currency={currency}
        isOver={isOver}
      />
      <BudgetOverspendAlert
        isOver={isOver}
        currency={currency}
        overspendAnalysis={overspendAnalysis}
        totalActual={summary.totalActual}
      />
      {isLoadingAI && <CardSkeleton />}
      {pendingSuggestions &&
        pendingSuggestions.length > 0 &&
        onAcceptSuggestions &&
        onDismissSuggestions && (
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
