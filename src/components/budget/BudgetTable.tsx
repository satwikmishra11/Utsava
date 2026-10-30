'use client';

import React, { useState } from 'react';
import { BudgetItem } from '@/domain/schemas';
import { ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { BudgetTableRow } from './BudgetTableRow';

export interface BudgetTableProps {
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly onUpdate: (id: string) => void;
  readonly onRemove: (id: string) => void;
}

const TABLE_HEADERS = ['Expense', 'Category', 'Estimated', 'Status', 'Actions'];

function BudgetTableHead(): React.JSX.Element {
  return (
    <thead>
      <tr className="budget-table-head-row">
        {TABLE_HEADERS.map((h) => (
          <th key={h} className="budget-table-th" scope="col">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function BudgetCategorySelect({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <>
      <label htmlFor="budget-category-filter" className="sr-only">
        Filter Expense Sector
      </label>
      <select
        id="budget-category-filter"
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '6px 10px', fontSize: '0.875rem' }}
      >
        <option value="all">All Categories</option>
        {ALL_BUDGET_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>
    </>
  );
}

function BudgetSearchInput({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <>
      <label htmlFor="budget-search" className="sr-only">
        Search Expenses
      </label>
      <input
        id="budget-search"
        type="search"
        className="input"
        placeholder="Filter expenses..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', maxWidth: '280px', padding: '6px 10px', fontSize: '0.875rem' }}
      />
    </>
  );
}

interface BudgetFilterControlsProps {
  readonly searchTerm: string;
  readonly onSearchChange: (v: string) => void;
  readonly categoryFilter: string;
  readonly onCategoryChange: (v: string) => void;
  readonly resultCount: number;
  readonly totalCount: number;
}

function BudgetTableFilters(props: BudgetFilterControlsProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '240px' }}
      >
        <BudgetSearchInput value={props.searchTerm} onChange={props.onSearchChange} />
        <BudgetCategorySelect value={props.categoryFilter} onChange={props.onCategoryChange} />
      </div>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Showing {props.resultCount} of {props.totalCount} expenses
      </span>
    </div>
  );
}

function filterBudgetItems(
  items: readonly BudgetItem[],
  searchTerm: string,
  categoryFilter: string
): readonly BudgetItem[] {
  const query = searchTerm.toLowerCase().trim();
  return items.filter((item) => {
    const label = (item.notes ?? item.id).toLowerCase();
    const matchesSearch = !query || label.includes(query);
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });
}

export function BudgetTable({
  items,
  currency,
  onUpdate,
  onRemove,
}: BudgetTableProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const filtered = filterBudgetItems(items, searchTerm, categoryFilter);

  return (
    <div className="table-container">
      <BudgetTableFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        resultCount={filtered.length}
        totalCount={items.length}
      />
      <table className="budget-table">
        <caption className="sr-only">Budget Expenses List</caption>
        <BudgetTableHead />
        <tbody>
          {filtered.map((item) => (
            <BudgetTableRow
              key={item.id}
              item={item}
              currency={currency}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
