import React from 'react';
import { OverspendAnalysis } from '@/domain/budgetLogic';
import { AlertTriangle } from 'lucide-react';

export interface BudgetOverspendAlertProps {
  readonly isOver: boolean;
  readonly currency: string;
  readonly overspendAnalysis?: OverspendAnalysis;
  readonly totalActual: number;
}

export function BudgetOverspendAlert({
  isOver,
  currency,
  overspendAnalysis,
  totalActual,
}: BudgetOverspendAlertProps): React.JSX.Element | null {
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
