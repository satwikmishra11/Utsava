'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { calculateSensitivityAnalysis, BudgetScenario } from '@/domain/budget/scenario';

const BADGE_STYLES = {
  over_budget: { background: '#fee2e2', color: '#991b1b' },
  tight: { background: '#fef3c7', color: '#92400e' },
  comfortable: { background: '#dcfce7', color: '#166534' },
} as const;

export function ScenarioStatusBadge({
  status,
}: {
  readonly status: 'comfortable' | 'tight' | 'over_budget';
}): React.JSX.Element {
  const isWarning = status !== 'comfortable';
  const Icon = isWarning ? AlertTriangle : CheckCircle2;
  const label =
    status === 'over_budget' ? 'Deficit' : status === 'tight' ? 'Tight Margin' : 'Within Budget';
  const style = {
    ...BADGE_STYLES[status],
    display: 'inline-flex',
    gap: '4px',
    alignItems: 'center',
  };

  return (
    <span className={`badge ${isWarning ? 'badge-warning' : 'badge-success'}`} style={style}>
      <Icon size={12} aria-hidden={true} /> {label}
    </span>
  );
}

function ScenarioTableRow({
  scenario,
  currency,
}: {
  readonly scenario: BudgetScenario;
  readonly currency: string;
}): React.JSX.Element {
  const isPositive = scenario.variance >= 0;
  const varianceColor = isPositive ? '#166534' : '#991b1b';
  const varianceText = isPositive
    ? `+${currency} ${scenario.variance.toLocaleString()}`
    : `-${currency} ${Math.abs(scenario.variance).toLocaleString()}`;

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '8px', fontWeight: 600 }}>{scenario.label}</td>
      <td style={{ padding: '8px' }}>{scenario.guestCount}</td>
      <td style={{ padding: '8px' }}>
        {currency} {scenario.projectedCost.toLocaleString()}
      </td>
      <td style={{ padding: '8px' }}>
        {currency} {scenario.perGuestCost.toLocaleString()}
      </td>
      <td style={{ padding: '8px', color: varianceColor, fontWeight: 600 }}>{varianceText}</td>
      <td style={{ padding: '8px' }}>
        <ScenarioStatusBadge status={scenario.status} />
      </td>
    </tr>
  );
}

function ScenarioTableHeader(): React.JSX.Element {
  return (
    <thead>
      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
        <th scope="col" style={{ padding: '8px' }}>
          Scenario
        </th>
        <th scope="col" style={{ padding: '8px' }}>
          Guests
        </th>
        <th scope="col" style={{ padding: '8px' }}>
          Projected Cost
        </th>
        <th scope="col" style={{ padding: '8px' }}>
          Per-Guest Spend
        </th>
        <th scope="col" style={{ padding: '8px' }}>
          Budget Variance
        </th>
        <th scope="col" style={{ padding: '8px' }}>
          Feasibility
        </th>
      </tr>
    </thead>
  );
}

export function ScenarioComparisonTable({
  scenarios,
  currency,
}: {
  readonly scenarios: ReturnType<typeof calculateSensitivityAnalysis>['scenarios'];
  readonly currency: string;
}): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto', marginTop: '14px' }}>
      <table
        className="table"
        style={{ width: '100%', fontSize: '0.85rem' }}
        aria-label="Budget scenario comparison"
      >
        <ScenarioTableHeader />
        <tbody>
          {scenarios.map((s) => (
            <ScenarioTableRow key={s.label} scenario={s} currency={currency} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
