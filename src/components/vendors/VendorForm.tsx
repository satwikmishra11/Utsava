'use client';

import React from 'react';
import { BudgetCategory } from '@/domain/types';
import { ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useVendorForm } from './useVendorForm';

export function VendorForm({
  onAdd,
}: {
  readonly onAdd: (name: string, cat: BudgetCategory, amount: string) => void;
}): React.JSX.Element {
  const { name, setName, category, setCategory, quotedAmount, setQuotedAmount, handleSubmit } =
    useVendorForm(onAdd);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      <input
        className="input"
        placeholder="Vendor business name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Vendor business name"
        required
      />
      <select
        className="select"
        value={category}
        onChange={(e) => setCategory(e.target.value as BudgetCategory)}
        aria-label="Vendor category"
      >
        {ALL_BUDGET_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
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
