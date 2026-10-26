'use client';

import React, { useState } from 'react';
import { BudgetItem, BudgetCategory } from '@/domain/types';
import { calculateBudgetSummary, ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { OverspendAnalysis } from '@/domain/budgetLogic';
import { GeneratedBudgetItem } from '@/services/ai';
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Check,
  X,
  Clock,
  BarChart3,
  Table as TableIcon,
} from 'lucide-react';
import { Button } from './ui/Button';
import { CardSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';

interface BudgetPlannerProps {
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
          Budget Status (Dual Coded)
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '6px',
            fontWeight: 700,
            fontSize: '1.05rem',
            color: isOver ? 'var(--accent-rose)' : 'var(--accent-emerald)',
          }}
        >
          {isOver ? (
            <>
              <AlertTriangle size={18} aria-hidden="true" />
              <span>
                Over Budget ({currency} {Math.abs(rem).toLocaleString()})
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>
                Under Budget ({currency} {rem.toLocaleString()} left)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BudgetCategoryBreakdown({
  items,
  currency,
  totalBudget,
}: {
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly totalBudget: number;
}): React.JSX.Element | null {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  if (items.length === 0) return null;

  const categoryTotals = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.estimated;
    return acc;
  }, {});

  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
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
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Category Spending Allocation</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setViewMode((m) => (m === 'chart' ? 'table' : 'chart'))}
          leftIcon={viewMode === 'chart' ? <TableIcon size={14} /> : <BarChart3 size={14} />}
        >
          {viewMode === 'chart' ? 'View as Data Table' : 'View as Chart'}
        </Button>
      </div>

      {viewMode === 'chart' ? (
        <div
          role="img"
          aria-label="Category Budget Breakdown Chart. Accessible data table alternative available via toggle."
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {entries.map(([cat, amt]) => {
            const pct = totalBudget > 0 ? Math.min(100, Math.round((amt / totalBudget) * 100)) : 0;
            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{cat}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {currency} {amt.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    background: 'var(--bg-surface)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'var(--accent-gold)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}
          >
            <caption className="sr-only">Budget Category Allocation Breakdown</caption>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <th scope="col" style={{ padding: '8px' }}>
                  Category
                </th>
                <th scope="col" style={{ padding: '8px' }}>
                  Estimated Cost
                </th>
                <th scope="col" style={{ padding: '8px' }}>
                  % of Budget
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([cat, amt]) => {
                const pct = totalBudget > 0 ? Math.round((amt / totalBudget) * 100) : 0;
                return (
                  <tr key={cat} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '8px', textTransform: 'capitalize', fontWeight: 600 }}>
                      {cat}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {currency} {amt.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px' }}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an expense title.');
      return;
    }
    const numCost = Number(cost);
    if (isNaN(numCost) || numCost <= 0) {
      setError('Please provide an expense amount greater than zero.');
      return;
    }
    setError('');
    onAdd(name.trim(), category, numCost);
    setName('');
    setCost('');
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
        gap: '12px',
        alignItems: 'flex-end',
        marginBottom: '24px',
      }}
    >
      <div>
        <label htmlFor="budget-item-name" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Expense Title
        </label>
        <input
          id="budget-item-name"
          className="input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Venue Deposit"
          aria-invalid={Boolean(error && !name.trim())}
          aria-describedby={error ? 'budget-form-error' : undefined}
          required
        />
      </div>
      <div>
        <label htmlFor="budget-item-category" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Category
        </label>
        <select
          id="budget-item-category"
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
        <label htmlFor="budget-item-cost" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Amount
        </label>
        <input
          id="budget-item-cost"
          type="number"
          min="1"
          className="input"
          value={cost}
          onChange={(e) => {
            setCost(e.target.value);
            if (error) setError('');
          }}
          placeholder="1000"
          aria-invalid={Boolean(error && (isNaN(Number(cost)) || Number(cost) <= 0))}
          aria-describedby={error ? 'budget-form-error' : undefined}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" id="btn-add-budget-item">
        <Plus size={16} aria-hidden="true" />
        <span>Add Expense</span>
      </button>

      {error && (
        <div
          id="budget-form-error"
          role="alert"
          aria-live="assertive"
          style={{ gridColumn: '1 / -1', color: 'var(--accent-rose)', fontSize: '0.85rem' }}
        >
          {error}
        </div>
      )}
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
        >
          <span className="sr-only">Toggle payment status for {item.notes ?? item.id}: </span>
          {item.actual > 0 ? (
            <span
              style={{
                color: 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={14} color="var(--accent-emerald)" aria-hidden="true" /> Paid
            </span>
          ) : (
            <span
              style={{
                color: 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={14} color="var(--accent-gold)" aria-hidden="true" /> Planned
            </span>
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
      <p style={{ marginTop: '4px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
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
      <BudgetCategoryBreakdown items={items} currency={currency} totalBudget={totalBudget} />
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
