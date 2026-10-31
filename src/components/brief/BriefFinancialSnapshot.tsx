'use client';

import React from 'react';
import { EventPlan } from '@/domain/types';
import { calculateBudgetSummary, calculatePerGuestCost } from '@/domain/budget';

function FinancialMetricCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): React.JSX.Element {
  return (
    <div
      style={{
        padding: '10px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
      <p style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{value}</p>
    </div>
  );
}

function buildMetrics(plan: EventPlan) {
  const summary = calculateBudgetSummary(plan.totalBudget, plan.budgetItems);
  const perGuest = calculatePerGuestCost(summary, plan.guestCount);
  return [
    { label: 'Target Budget', value: `${plan.currency} ${summary.totalBudget.toLocaleString()}` },
    { label: 'Committed Cost', value: `${plan.currency} ${summary.totalActual.toLocaleString()}` },
    {
      label: 'Cost Per Guest',
      value: `${plan.currency} ${perGuest.actualPerGuest.toLocaleString()} / head`,
    },
    { label: 'Remaining', value: `${plan.currency} ${summary.remainingBudget.toLocaleString()}` },
  ];
}

export function BriefFinancialSnapshot({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  const metrics = buildMetrics(plan);

  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
        Financial Health & Per-Guest Allocation
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}
      >
        {metrics.map((m) => (
          <FinancialMetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
    </div>
  );
}
