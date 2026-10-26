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
    <div role="alert" className="budget-overspend-alert">
      <div className="budget-overspend-header">
        <AlertTriangle size={18} aria-hidden="true" />
        <span>Overspend Alert</span>
      </div>
      <p className="budget-overspend-text">
        Total expenses exceed target budget by {overspendAnalysis?.overspentPercentage ?? 0}% (
        {currency} {(overspendAnalysis?.totalSpent ?? totalActual).toLocaleString()}).
      </p>
    </div>
  );
}
