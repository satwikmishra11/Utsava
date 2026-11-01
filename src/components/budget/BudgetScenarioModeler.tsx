'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { BudgetItem } from '@/domain/schemas';
import { calculateSensitivityAnalysis, buildScenario } from '@/domain/budget/scenario';
import { ScenarioComparisonTable, ScenarioStatusBadge } from './ScenarioComparisonTable';

interface BudgetScenarioModelerProps {
  readonly totalBudget: number;
  readonly guestCount: number;
  readonly currency: string;
  readonly items: readonly BudgetItem[];
}

const BOX_STYLE = {
  padding: '10px',
  borderRadius: '6px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
} as const;

function KpiBox({
  label,
  value,
  highlight,
}: {
  readonly label: string;
  readonly value: string;
  readonly highlight?: boolean;
}): React.JSX.Element {
  return (
    <div style={BOX_STYLE}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: highlight ? 'var(--accent-gold)' : 'var(--text-primary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ScenarioKpiCards({
  analysis,
  currency,
}: {
  readonly analysis: ReturnType<typeof calculateSensitivityAnalysis>;
  readonly currency: string;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        marginTop: '12px',
      }}
    >
      <KpiBox
        label="Fixed Overhead"
        value={`${currency} ${analysis.fixedCostTotal.toLocaleString()} (${analysis.fixedCostRatio}%)`}
      />
      <KpiBox
        label="Variable (Per-Head)"
        value={`${currency} ${analysis.variableCostTotal.toLocaleString()} (${analysis.variableCostRatio}%)`}
      />
      <KpiBox
        label="Marginal / Extra Guest"
        value={`${currency} ${analysis.marginalPerGuestCost.toLocaleString()}`}
        highlight={true}
      />
      <KpiBox label="Max Sustainable Guests" value={`${analysis.maxAffordableGuests} guests`} />
    </div>
  );
}

function SimulatorHeader({
  customGuests,
  currency,
  projectedCost,
  status,
}: {
  readonly customGuests: number;
  readonly currency: string;
  readonly projectedCost: number;
  readonly status: 'comfortable' | 'tight' | 'over_budget';
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <label htmlFor="custom-guest-slider" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
        Interactive Guest Count Simulator:{' '}
        <span style={{ color: 'var(--accent-gold)' }}>{customGuests} Guests</span>
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem' }}>
          Projected:{' '}
          <strong>
            {currency} {projectedCost.toLocaleString()}
          </strong>
        </span>
        <ScenarioStatusBadge status={status} />
      </div>
    </div>
  );
}

function GuestRangeInput({
  value,
  onChange,
}: {
  readonly value: number;
  readonly onChange: (v: number) => void;
}): React.JSX.Element {
  return (
    <input
      id="custom-guest-slider"
      type="range"
      min={10}
      max={Math.max(300, value * 2)}
      step={5}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', marginTop: '8px', cursor: 'pointer' }}
      aria-label="Adjust custom guest count simulation"
    />
  );
}

function ScenarioSimulatorControls({
  customGuests,
  onChange,
  currency,
  totalBudget,
  fixedTotal,
  marginalCost,
}: {
  readonly customGuests: number;
  readonly onChange: (val: number) => void;
  readonly currency: string;
  readonly totalBudget: number;
  readonly fixedTotal: number;
  readonly marginalCost: number;
}): React.JSX.Element {
  const projected = buildScenario('Custom', customGuests, fixedTotal, marginalCost, totalBudget);

  return (
    <div
      style={{
        marginTop: '14px',
        padding: '12px',
        background: 'var(--bg-secondary)',
        borderRadius: '6px',
        border: '1px solid var(--border)',
      }}
    >
      <SimulatorHeader
        customGuests={customGuests}
        currency={currency}
        projectedCost={projected.projectedCost}
        status={projected.status}
      />
      <GuestRangeInput value={customGuests} onChange={onChange} />
    </div>
  );
}

const TOGGLE_STYLE = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  background: 'transparent',
} as const;

function ScenarioModelerToggle({
  isOpen,
  onToggle,
}: {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      id="btn-toggle-scenario-modeler"
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="scenario-modeler-content"
      className="btn"
      style={TOGGLE_STYLE}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        <SlidersHorizontal size={16} aria-hidden={true} style={{ color: 'var(--accent-gold)' }} />
        <span>What-If Scenario & Guest Sensitivity Modeler</span>
      </span>
      {isOpen ? (
        <ChevronUp size={16} aria-hidden={true} />
      ) : (
        <ChevronDown size={16} aria-hidden={true} />
      )}
    </button>
  );
}

export function BudgetScenarioModeler({
  totalBudget,
  guestCount,
  currency,
  items,
}: BudgetScenarioModelerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [customGuests, setCustomGuests] = useState(guestCount);
  const analysis = calculateSensitivityAnalysis(totalBudget, guestCount, items);

  return (
    <div
      style={{
        margin: '14px 0',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        background: 'var(--bg-primary)',
      }}
    >
      <ScenarioModelerToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <div
          id="scenario-modeler-content"
          style={{ padding: '0 14px 14px 14px', borderTop: '1px solid var(--border)' }}
        >
          <ScenarioKpiCards analysis={analysis} currency={currency} />
          <ScenarioSimulatorControls
            customGuests={customGuests}
            onChange={setCustomGuests}
            currency={currency}
            totalBudget={totalBudget}
            fixedTotal={analysis.fixedCostTotal}
            marginalCost={analysis.marginalPerGuestCost}
          />
          <ScenarioComparisonTable scenarios={analysis.scenarios} currency={currency} />
        </div>
      )}
    </div>
  );
}
