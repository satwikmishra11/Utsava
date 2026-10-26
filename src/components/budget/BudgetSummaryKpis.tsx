import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface BudgetSummaryKpisProps {
  readonly total: number;
  readonly actual: number;
  readonly paid: number;
  readonly rem: number;
  readonly currency: string;
  readonly isOver: boolean;
}

const KPI_GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

function KpiCard({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  );
}

function KpiValueDisplay({
  value,
  color,
}: {
  readonly value: string;
  readonly color?: string;
}): React.JSX.Element {
  return <p style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color }}>{value}</p>;
}

function BudgetStatusDisplay({
  isOver,
  rem,
  currency,
}: {
  readonly isOver: boolean;
  readonly rem: number;
  readonly currency: string;
}): React.JSX.Element {
  const color = isOver ? 'var(--accent-rose)' : 'var(--accent-emerald)';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '6px',
        fontWeight: 700,
        fontSize: '1.05rem',
        color,
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
  );
}

export function BudgetSummaryKpis({
  total,
  actual,
  paid,
  rem,
  currency,
  isOver,
}: BudgetSummaryKpisProps): React.JSX.Element {
  const cards = [
    { label: 'Total Target Budget', value: `${currency} ${total.toLocaleString()}` },
    {
      label: 'Committed Expenses',
      value: `${currency} ${actual.toLocaleString()}`,
      color: isOver ? 'var(--accent-rose)' : 'var(--text-primary)',
    },
    {
      label: 'Paid to Date',
      value: `${currency} ${paid.toLocaleString()}`,
      color: 'var(--accent-emerald)',
    },
  ];

  return (
    <div style={KPI_GRID_STYLE}>
      {cards.map(({ label, value, color }) => (
        <KpiCard key={label} label={label}>
          <KpiValueDisplay value={value} color={color} />
        </KpiCard>
      ))}
      <KpiCard label="Budget Status (Dual Coded)">
        <BudgetStatusDisplay isOver={isOver} rem={rem} currency={currency} />
      </KpiCard>
    </div>
  );
}
