import React from 'react';
import { Input } from '../ui/Input';

export interface WizardStep4Props {
  readonly totalBudget: string;
  readonly setTotalBudget: (v: string) => void;
  readonly currency: string;
  readonly setCurrency: (v: string) => void;
  readonly budgetError?: string;
}

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
] as const;

export function WizardStep4({
  totalBudget,
  setTotalBudget,
  currency,
  setCurrency,
  budgetError,
}: WizardStep4Props): React.JSX.Element {
  return (
    <div className="wizard-form-grid">
      <Input
        label="Total Target Budget"
        type="number"
        min="100"
        value={totalBudget}
        onChange={(e) => setTotalBudget(e.target.value)}
        id="wizard-budget"
        error={budgetError}
        required
      />
      <div className="wizard-field-group">
        <label htmlFor="wizard-currency" className="wizard-field-label">
          Currency
        </label>
        <select
          id="wizard-currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="select"
        >
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
