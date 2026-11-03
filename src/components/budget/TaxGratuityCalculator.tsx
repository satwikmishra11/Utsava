'use client';

import React, { useState } from 'react';
import { Percent, ChevronDown, ChevronUp } from 'lucide-react';
import { BudgetItem } from '@/domain/schemas';
import {
  calculateTrueCostLiability,
  REGIONAL_PRESETS,
  RegionalTaxPresetId,
  TrueCostAnalysis,
} from '@/domain/budget/taxAndGratuity';
import { TaxBreakdownTable, TaxDeficitNotice } from './TaxBreakdownTable';
import { TaxPresetSelector, TaxRateSliders } from './TaxPresetControls';

interface TaxGratuityCalculatorProps {
  readonly totalBudget: number;
  readonly currency: string;
  readonly items: readonly BudgetItem[];
}

const TOGGLE_BTN_STYLE: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

function TaxToggleBtn({
  isOpen,
  hiddenFeePercent,
  onToggle,
}: {
  readonly isOpen: boolean;
  readonly hiddenFeePercent: number;
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      id="btn-toggle-tax-calculator"
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="tax-calculator-content"
      className="btn"
      style={TOGGLE_BTN_STYLE}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
        <Percent size={16} aria-hidden={true} style={{ color: 'var(--accent-gold)' }} />
        <span>Regional Tax, Gratuity & True Cost Forecaster</span>
        <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
          +{hiddenFeePercent}% Overhead
        </span>
      </span>
      {isOpen ? (
        <ChevronUp size={16} aria-hidden={true} />
      ) : (
        <ChevronDown size={16} aria-hidden={true} />
      )}
    </button>
  );
}

function TaxKpiCard({
  label,
  value,
  color,
}: {
  readonly label: string;
  readonly value: string;
  readonly color?: string;
}): React.JSX.Element {
  return (
    <div className="card" style={{ padding: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: color ?? 'inherit' }}>{value}</div>
    </div>
  );
}

function TaxSummaryKpis({
  analysis,
  currency,
}: {
  readonly analysis: TrueCostAnalysis;
  readonly currency: string;
}): React.JSX.Element {
  const marginLabel = analysis.isDeficit ? 'Post-Tax Deficit' : 'Post-Tax Safety Buffer';
  const marginColor = analysis.isDeficit ? 'var(--accent-rose)' : 'var(--accent-emerald)';
  const marginVal = `${currency} ${Math.abs(analysis.safetyMarginAmount).toLocaleString()}`;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        marginBottom: '14px',
      }}
    >
      <TaxKpiCard
        label="Net Contract Subtotal"
        value={`${currency} ${analysis.netContractSubtotal.toLocaleString()}`}
      />
      <TaxKpiCard
        label="Taxes & Fees Overhead"
        value={`+${analysis.hiddenFeePercentage}%`}
        color="var(--accent-gold)"
      />
      <TaxKpiCard
        label="Projected Gross Liability"
        value={`${currency} ${analysis.totalGrossLiability.toLocaleString()}`}
      />
      <TaxKpiCard label={marginLabel} value={marginVal} color={marginColor} />
    </div>
  );
}

function useTaxState() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<RegionalTaxPresetId>('us_standard');
  const [taxRate, setTaxRate] = useState(8.5);
  const [gratuityRate, setGratuityRate] = useState(18.0);

  function handleSelectPreset(id: RegionalTaxPresetId) {
    setSelectedPreset(id);
    const p = REGIONAL_PRESETS.find((preset) => preset.id === id);
    if (p) {
      setTaxRate(p.defaultTaxRate);
      setGratuityRate(p.defaultGratuityRate);
    }
  }

  return {
    isOpen,
    setIsOpen,
    selectedPreset,
    taxRate,
    gratuityRate,
    handleSelectPreset,
    handleCustomTax: (v: number) => {
      setTaxRate(v);
      setSelectedPreset('custom');
    },
    handleCustomGratuity: (v: number) => {
      setGratuityRate(v);
      setSelectedPreset('custom');
    },
  };
}

interface TaxCalculatorContentProps {
  readonly state: ReturnType<typeof useTaxState>;
  readonly analysis: TrueCostAnalysis;
  readonly currency: string;
}

function TaxCalculatorContent({
  state,
  analysis,
  currency,
}: TaxCalculatorContentProps): React.JSX.Element {
  return (
    <div
      id="tax-calculator-content"
      style={{ padding: '12px', borderTop: '1px solid var(--border)' }}
    >
      <TaxPresetSelector selected={state.selectedPreset} onSelect={state.handleSelectPreset} />
      <TaxRateSliders
        taxRate={state.taxRate}
        gratuityRate={state.gratuityRate}
        onTaxChange={state.handleCustomTax}
        onGratuityChange={state.handleCustomGratuity}
      />
      <TaxSummaryKpis analysis={analysis} currency={currency} />
      <TaxBreakdownTable
        analysis={analysis}
        currency={currency}
        taxRate={state.taxRate}
        gratuityRate={state.gratuityRate}
      />
      <TaxDeficitNotice
        isDeficit={analysis.isDeficit}
        currency={currency}
        deficitAmount={analysis.safetyMarginAmount}
      />
    </div>
  );
}

export function TaxGratuityCalculator({
  totalBudget,
  currency,
  items,
}: TaxGratuityCalculatorProps): React.JSX.Element {
  const s = useTaxState();
  const analysis = calculateTrueCostLiability(totalBudget, items, s.taxRate, s.gratuityRate);

  return (
    <div
      style={{
        margin: '12px 0',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-secondary)',
      }}
    >
      <TaxToggleBtn
        isOpen={s.isOpen}
        hiddenFeePercent={analysis.hiddenFeePercentage}
        onToggle={() => s.setIsOpen((prev) => !prev)}
      />
      {s.isOpen && <TaxCalculatorContent state={s} analysis={analysis} currency={currency} />}
    </div>
  );
}
