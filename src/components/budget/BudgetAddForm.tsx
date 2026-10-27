import React, { useState } from 'react';
import { BudgetCategory } from '@/domain/schemas';
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

function BudgetTitleInput({
  name,
  setName,
  error,
  clearError,
}: {
  readonly name: string;
  readonly setName: (val: string) => void;
  readonly error: string;
  readonly clearError: () => void;
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor="budget-item-name" className="budget-input-label">
        Expense Title
      </label>
      <input
        id="budget-item-name"
        className="input"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) clearError();
        }}
        placeholder="e.g. Venue Deposit"
        aria-invalid={Boolean(error && !name.trim())}
        aria-describedby={error ? 'budget-form-error' : undefined}
        required
      />
    </div>
  );
}

function BudgetCategorySelect({
  category,
  setCategory,
}: {
  readonly category: BudgetCategory;
  readonly setCategory: (c: BudgetCategory) => void;
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor="budget-item-category" className="budget-input-label">
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
  );
}

function BudgetAmountInput({
  cost,
  setCost,
  error,
  clearError,
}: {
  readonly cost: string;
  readonly setCost: (val: string) => void;
  readonly error: string;
  readonly clearError: () => void;
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor="budget-item-cost" className="budget-input-label">
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
          if (error) clearError();
        }}
        placeholder="1000"
        aria-invalid={Boolean(error && (isNaN(Number(cost)) || Number(cost) <= 0))}
        aria-describedby={error ? 'budget-form-error' : undefined}
        required
      />
    </div>
  );
}

export function BudgetAddForm({ onAdd }: BudgetAddFormProps): React.JSX.Element {
  const { name, setName, category, setCategory, cost, setCost, error, setError, submit } =
    useBudgetAddForm(onAdd);
  const clearError = () => setError('');

  return (
    <form onSubmit={submit} noValidate className="budget-add-form">
      <BudgetTitleInput name={name} setName={setName} error={error} clearError={clearError} />
      <BudgetCategorySelect category={category} setCategory={setCategory} />
      <BudgetAmountInput cost={cost} setCost={setCost} error={error} clearError={clearError} />
      <button type="submit" className="btn btn-primary" id="btn-add-budget-item">
        <Plus size={16} aria-hidden="true" />
        <span>Add Expense</span>
      </button>
      {error && (
        <div
          id="budget-form-error"
          role="alert"
          aria-live="assertive"
          className="budget-form-error"
        >
          {error}
        </div>
      )}
    </form>
  );
}
