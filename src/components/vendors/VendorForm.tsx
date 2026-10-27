'use client';

import React from 'react';
import { BudgetCategory } from '@/domain/schemas';
import { ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useVendorForm } from './useVendorForm';

const FORM_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
  gap: '12px',
  marginBottom: '24px',
};

function VendorCategorySelect({
  value,
  onChange,
}: {
  readonly value: BudgetCategory;
  readonly onChange: (c: BudgetCategory) => void;
}): React.JSX.Element {
  return (
    <select
      className="select"
      value={value}
      onChange={(e) => onChange(e.target.value as BudgetCategory)}
      aria-label="Vendor category"
    >
      {ALL_BUDGET_CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

export function VendorForm({
  onAdd,
}: {
  readonly onAdd: (name: string, cat: BudgetCategory, amount: string) => void;
}): React.JSX.Element {
  const { name, setName, category, setCategory, quotedAmount, setQuotedAmount, handleSubmit } =
    useVendorForm(onAdd);

  return (
    <form onSubmit={handleSubmit} style={FORM_STYLE}>
      <input
        className="input"
        placeholder="Vendor business name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Vendor business name"
        required
      />
      <VendorCategorySelect value={category} onChange={setCategory} />
      <input
        className="input"
        type="number"
        min="0"
        placeholder="Quote amount"
        value={quotedAmount}
        onChange={(e) => setQuotedAmount(e.target.value)}
        aria-label="Quote amount"
      />
      <Button type="submit" variant="primary" leftIcon={<Plus size={16} />} id="btn-add-vendor">
        Add Vendor
      </Button>
    </form>
  );
}
