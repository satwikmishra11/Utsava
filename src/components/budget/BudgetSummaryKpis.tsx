import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface BudgetSummaryKpisProps {
  readonly total: number;
  readonly actual: number;
  readonly paid: number;
  readonly rem: number;
  readonly currency: string;
  readonly isOver: boolean;
  readonly guestCount?: number;
}

function KpiCard({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="budget-kpi-card">
      <span className="budget-kpi-label">{label}</span>
      {children}
    </div>
  );
}

function KpiValueDisplay({
  value,
  className,
}: {
  readonly value: string;
  readonly className?: string;
}): React.JSX.Element {
  return <p className={`budget-kpi-value ${className ?? ''}`.trim()}>{value}</p>;
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
  const statusClass = isOver ? 'text-accent-rose' : 'text-accent-emerald';
  return (
    <div className={`budget-status-display ${statusClass}`}>
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

function createBudgetCards(props: {
  readonly total: number;
  readonly actual: number;
  readonly paid: number;
  readonly currency: string;
  readonly isOver: boolean;
  readonly guestCount?: number;
}) {
  const { total, actual, paid, currency, isOver, guestCount } = props;
  const perGuest = guestCount && guestCount > 0 ? Math.round(actual / guestCount) : 0;
  return [
    { label: 'Total Target Budget', value: `${currency} ${total.toLocaleString()}` },
    {
      label: 'Committed Expenses',
      value: `${currency} ${actual.toLocaleString()}`,
      className: isOver ? 'text-accent-rose' : 'text-primary-color',
    },
    {
      label: 'Paid to Date',
      value: `${currency} ${paid.toLocaleString()}`,
      className: 'text-accent-emerald',
    },
    ...(guestCount && guestCount > 0
      ? [
          {
            label: 'Cost Per Guest',
            value: `${currency} ${perGuest.toLocaleString()} / head`,
            className: 'text-accent-gold',
          },
        ]
      : []),
  ];
}

export function BudgetSummaryKpis(props: BudgetSummaryKpisProps): React.JSX.Element {
  const cards = createBudgetCards(props);
  const { isOver, rem, currency } = props;

  return (
    <div className="budget-kpi-grid">
      {cards.map(({ label, value, className }) => (
        <KpiCard key={label} label={label}>
          <KpiValueDisplay value={value} className={className} />
        </KpiCard>
      ))}
      <KpiCard label="Budget Status (Dual Coded)">
        <BudgetStatusDisplay isOver={isOver} rem={rem} currency={currency} />
      </KpiCard>
    </div>
  );
}
