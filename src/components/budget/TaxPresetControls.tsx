'use client';

import React from 'react';
import { REGIONAL_PRESETS, RegionalTaxPresetId } from '@/domain/budget/taxAndGratuity';

export function TaxPresetSelector({
  selected,
  onSelect,
}: {
  readonly selected: RegionalTaxPresetId;
  readonly onSelect: (id: RegionalTaxPresetId) => void;
}): React.JSX.Element {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '6px',
        }}
      >
        Regional Tax Presets
      </div>
      <div
        style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
        role="group"
        aria-label="Regional tax rate presets"
      >
        {REGIONAL_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`btn ${selected === p.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            aria-pressed={selected === p.id}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RateSliderInput({
  id,
  label,
  value,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly onChange: (v: number) => void;
}): React.JSX.Element {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          marginBottom: '4px',
        }}
      >
        <label htmlFor={id}>{label}</label>
        <span style={{ fontWeight: 600 }}>{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="30"
        step="0.5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export function TaxRateSliders({
  taxRate,
  gratuityRate,
  onTaxChange,
  onGratuityChange,
}: {
  readonly taxRate: number;
  readonly gratuityRate: number;
  readonly onTaxChange: (v: number) => void;
  readonly onGratuityChange: (v: number) => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '14px',
      }}
    >
      <RateSliderInput
        id="tax-rate-slider"
        label="Sales Tax / GST Rate"
        value={taxRate}
        onChange={onTaxChange}
      />
      <RateSliderInput
        id="gratuity-rate-slider"
        label="Service Fee / Gratuity"
        value={gratuityRate}
        onChange={onGratuityChange}
      />
    </div>
  );
}
