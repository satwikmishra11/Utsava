'use client';

import React, { useState } from 'react';
import { BudgetItem, BudgetCategory } from '@/domain/types';
import { calculateBudgetSummary, detectBudgetRisks, ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetPlannerProps {
  readonly totalBudget: number;
  readonly currency: string;
  readonly items: readonly BudgetItem[];
  readonly onAddItem: (item: BudgetItem) => void;
  readonly onRemoveItem: (id: string) => void;
  readonly onUpdateStatus: (id: string) => void;
}

export function BudgetPlanner({
  totalBudget,
  currency,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateStatus,
}: BudgetPlannerProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('venue');
  const [estimatedCost, setEstimatedCost] = useState('');

  const summary = calculateBudgetSummary(totalBudget, items);
  const risks = detectBudgetRisks(summary);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(estimatedCost);
    if (!name.trim() || isNaN(cost) || cost <= 0) return;

    onAddItem({
      id: `budget-${Date.now()}`,
      eventId: 'evt-utsava-main',
      category,
      estimated: cost,
      actual: cost,
      notes: name.trim(),
    });
    setName('');
    setEstimatedCost('');
  };

  return (
    <section id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="card">
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>
        Event Budget & Cost Allocation
      </h2>

      {/* Summary KPI Cards */}
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
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Planned</span>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>
            {currency} {summary.totalBudget.toLocaleString()}
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
            Committed Actual
          </span>
          <p
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginTop: '4px',
              color: summary.isOverBudget ? 'var(--accent-rose)' : 'var(--text-primary)',
            }}
          >
            {currency} {summary.totalActual.toLocaleString()}
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
              fontSize: '1.5rem',
              fontWeight: 700,
              marginTop: '4px',
              color: 'var(--accent-emerald)',
            }}
          >
            {currency} {summary.totalPaid.toLocaleString()}
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
              fontSize: '1.5rem',
              fontWeight: 700,
              marginTop: '4px',
              color: summary.isOverBudget ? 'var(--accent-rose)' : 'var(--accent-gold)',
            }}
          >
            {currency} {summary.remainingBudget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Risk Alert Banner */}
      {risks.length > 0 && (
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
            <span>Budget Risk Alerts</span>
          </div>
          <ul
            style={{
              marginTop: '8px',
              paddingLeft: '24px',
              fontSize: '0.9rem',
              color: '#fca5a5',
            }}
          >
            {risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Item Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: '2 1 200px' }}>
          <label
            htmlFor="budget-item-name"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              marginBottom: '4px',
              color: 'var(--text-secondary)',
            }}
          >
            Expense Name
          </label>
          <input
            id="budget-item-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Traditional Mandap Decor"
            required
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label
            htmlFor="budget-item-cat"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              marginBottom: '4px',
              color: 'var(--text-secondary)',
            }}
          >
            Category
          </label>
          <select
            id="budget-item-cat"
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value as BudgetCategory)}
          >
            {ALL_BUDGET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label
            htmlFor="budget-item-cost"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              marginBottom: '4px',
              color: 'var(--text-secondary)',
            }}
          >
            Cost ({currency})
          </label>
          <input
            id="budget-item-cost"
            type="number"
            min="1"
            className="input"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="500"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" id="btn-add-budget-item">
          <Plus size={16} aria-hidden="true" />
          <span>Add Expense</span>
        </button>
      </form>

      {/* Items Table */}
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
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{item.notes ?? item.id}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span className="badge badge-gold">{item.category}</span>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  {currency} {item.estimated.toLocaleString()}
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <button
                    onClick={() => onUpdateStatus(item.id)}
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
                    onClick={() => onRemoveItem(item.id)}
                    className="btn btn-secondary"
                    style={{ padding: '6px', color: 'var(--accent-rose)' }}
                    aria-label={`Delete ${item.notes ?? item.id}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
