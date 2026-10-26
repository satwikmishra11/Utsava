import React, { useState } from 'react';
import { BudgetCategory } from '@/domain/types';
import { ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { Plus } from 'lucide-react';

export interface BudgetAddFormProps {
  readonly onAdd: (name: string, category: BudgetCategory, cost: number) => void;
}

export function useBudgetAddForm(
  onAdd: (name: string, category: BudgetCategory, cost: number) => void
) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('venue');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an expense title.');
      return;
    }
    const numCost = Number(cost);
    if (isNaN(numCost) || numCost <= 0) {
      setError('Please provide an expense amount greater than zero.');
      return;
    }
    setError('');
    onAdd(name.trim(), category, numCost);
    setName('');
    setCost('');
  };

  return { name, setName, category, setCategory, cost, setCost, error, setError, submit };
}

export function BudgetAddForm({ onAdd }: BudgetAddFormProps): React.JSX.Element {
  const { name, setName, category, setCategory, cost, setCost, error, setError, submit } =
    useBudgetAddForm(onAdd);

  return (
    <form
      onSubmit={submit}
      noValidate
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
        gap: '12px',
        alignItems: 'flex-end',
        marginBottom: '24px',
      }}
    >
      <div>
        <label htmlFor="budget-item-name" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Expense Title
        </label>
        <input
          id="budget-item-name"
          className="input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Venue Deposit"
          aria-invalid={Boolean(error && !name.trim())}
          aria-describedby={error ? 'budget-form-error' : undefined}
          required
        />
      </div>
      <div>
        <label htmlFor="budget-item-category" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Category
        </label>
        <select
          id="budget-item-category"
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value as BudgetCategory)}
        >
          {ALL_BUDGET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="budget-item-cost" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Amount
        </label>
        <input
          id="budget-item-cost"
          type="number"
          min="1"
          className="input"
          value={cost}
          onChange={(e) => {
            setCost(e.target.value);
            if (error) setError('');
          }}
          placeholder="1000"
          aria-invalid={Boolean(error && (isNaN(Number(cost)) || Number(cost) <= 0))}
          aria-describedby={error ? 'budget-form-error' : undefined}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" id="btn-add-budget-item">
        <Plus size={16} aria-hidden="true" />
        <span>Add Expense</span>
      </button>

      {error && (
        <div
          id="budget-form-error"
          role="alert"
          aria-live="assertive"
          style={{ gridColumn: '1 / -1', color: 'var(--accent-rose)', fontSize: '0.85rem' }}
        >
          {error}
        </div>
      )}
    </form>
  );
}
