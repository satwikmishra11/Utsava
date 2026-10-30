'use client';

import React, { useState } from 'react';
import { VendorItem } from '@/domain/types';
import { BudgetCategory } from '@/domain/schemas';
import { ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { GeneratedVendorItem } from '@/services/ai';
import { calculateVendorFinancials } from '@/domain/vendors';
import { CardSkeleton } from '../ui/Skeleton';
import { VendorChecklistProps } from './types';
import { VendorChecklistHeader } from './VendorChecklistHeader';
import { VendorSuggestionsAlert } from './VendorSuggestionsAlert';
import { VendorForm } from './VendorForm';
import { VendorBoardGrid } from './VendorBoardGrid';

function createVendorItem(name: string, category: BudgetCategory, amount: string): VendorItem {
  return {
    id: `v-${Date.now()}`,
    category,
    name,
    status: 'shortlisted',
    quotedAmount: Number(amount) || 0,
    deliverables: ['Contract Review'],
  };
}

function VendorAlertSection({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions?: readonly GeneratedVendorItem[] | null;
  readonly onAccept?: () => void;
  readonly onDismiss?: () => void;
}): React.JSX.Element | null {
  if (!suggestions?.length || !onAccept || !onDismiss) return null;
  return (
    <VendorSuggestionsAlert suggestions={suggestions} onAccept={onAccept} onDismiss={onDismiss} />
  );
}

function filterVendorItems(
  vendors: readonly VendorItem[],
  query: string,
  category: string
): readonly VendorItem[] {
  const q = query.toLowerCase().trim();
  return vendors.filter((v) => {
    const matchesQuery = !q || v.name.toLowerCase().includes(q);
    const matchesCat = category === 'all' || v.category === category;
    return matchesQuery && matchesCat;
  });
}

function VendorNameInput({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <>
      <label htmlFor="vendor-search" className="sr-only">
        Filter Vendors by Name
      </label>
      <input
        id="vendor-search"
        type="search"
        className="input"
        placeholder="Filter vendors by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', maxWidth: '260px', padding: '6px 12px', fontSize: '0.875rem' }}
      />
    </>
  );
}

function VendorCategorySelect({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (c: string) => void;
}): React.JSX.Element {
  return (
    <>
      <label htmlFor="vendor-category-filter" className="sr-only">
        Filter Vendor Sector
      </label>
      <select
        id="vendor-category-filter"
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

interface VendorSearchFilterProps {
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly categoryFilter: string;
  readonly onCategoryChange: (c: string) => void;
  readonly resultCount: number;
  readonly totalCount: number;
}

function VendorSearchFilter(props: VendorSearchFilterProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '12px 0',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <div
        style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '240px' }}
      >
        <VendorNameInput value={props.searchQuery} onChange={props.onSearchChange} />
        <VendorCategorySelect value={props.categoryFilter} onChange={props.onCategoryChange} />
      </div>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Showing {props.resultCount} of {props.totalCount} vendors
      </span>
    </div>
  );
}

function VendorTopSection({
  props,
  financials,
}: {
  readonly props: VendorChecklistProps;
  readonly financials: ReturnType<typeof calculateVendorFinancials>;
}): React.JSX.Element {
  return (
    <>
      <VendorChecklistHeader
        currency={props.currency}
        totalCommitment={financials.totalBooked + financials.totalPaid}
        totalPaid={financials.totalPaid}
        balanceDue={financials.balanceDue}
        onRegenerateAI={props.onRegenerateAI}
        onExportCSV={props.onExportCSV}
        isLoadingAI={props.isLoadingAI}
      />
      {props.isLoadingAI && <CardSkeleton />}
      <VendorAlertSection
        suggestions={props.pendingSuggestions}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
      />
    </>
  );
}

export function VendorChecklist(props: VendorChecklistProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const financials = calculateVendorFinancials(props.vendors);
  const filtered = filterVendorItems(props.vendors, searchQuery, categoryFilter);

  return (
    <section id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" className="card">
      <VendorTopSection props={props} financials={financials} />
      <VendorForm onAdd={(n, cat, amt) => props.onAddVendor(createVendorItem(n, cat, amt))} />
      <VendorSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        resultCount={filtered.length}
        totalCount={props.vendors.length}
      />
      <VendorBoardGrid
        vendors={filtered}
        currency={props.currency}
        onUpdateStatus={props.onUpdateStatus}
        onRegenerateAI={props.onRegenerateAI}
      />
    </section>
  );
}
