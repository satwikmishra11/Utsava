'use client';

import React, { useState } from 'react';
import { VendorItem, VendorStatus, BudgetCategory } from '@/domain/types';
import { calculateVendorTotalCommitment } from '@/domain/vendors';
import { ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { GeneratedVendorItem } from '@/services/ai';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { CardSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { AiSuggestionsBanner } from './ui/AiSuggestionsBanner';

export interface VendorChecklistProps {
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
  readonly onAddVendor: (vendor: VendorItem) => void;
  readonly onUpdateStatus: (id: string, status: VendorStatus) => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly GeneratedVendorItem[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
}

const STATUS_TITLES: Record<VendorStatus, { label: string; badge: string; next?: VendorStatus }> = {
  shortlisted: { label: 'Shortlisted', badge: 'badge-gold', next: 'booked' },
  booked: { label: 'Booked & Contracted', badge: 'badge-emerald', next: 'paid' },
  paid: { label: 'Paid in Full', badge: 'badge-emerald' },
};

function VendorSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions: readonly GeneratedVendorItem[];
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
}): React.JSX.Element {
  return (
    <AiSuggestionsBanner
      title="✨ AI Recommended Vendors Ready"
      description={`${suggestions.length} specialist vendor profiles generated.`}
      acceptLabel="Accept Vendors"
      dismissLabel="Dismiss"
      acceptId="btn-accept-vendors-ai"
      dismissId="btn-dismiss-vendors-ai"
      onAccept={onAccept}
      onDismiss={onDismiss}
    />
  );
}

function VendorCard({
  vendor,
  currency,
  onUpdate,
}: {
  readonly vendor: VendorItem;
  readonly currency: string;
  readonly onUpdate: (id: string, s: VendorStatus) => void;
}): React.JSX.Element {
  const meta = STATUS_TITLES[vendor.status];
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{vendor.name}</h4>
        <span className={`badge ${meta.badge}`}>{vendor.category}</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {vendor.deliverables.join(' • ') || 'General services'}
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
          {currency} {vendor.quotedAmount.toLocaleString()}
        </span>
        {meta.next && (
          <Button
            onClick={() => onUpdate(vendor.id, meta.next!)}
            size="sm"
            variant="secondary"
            rightIcon={<ArrowRight size={14} />}
          >
            Move to {meta.next}
          </Button>
        )}
      </div>
    </div>
  );
}

function VendorBoardColumn({
  status,
  vendors,
  currency,
  onUpdate,
}: {
  readonly status: VendorStatus;
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
  readonly onUpdate: (id: string, s: VendorStatus) => void;
}): React.JSX.Element {
  const colVendors = vendors.filter((v) => v.status === status);
  const meta = STATUS_TITLES[status];
  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{meta.label}</h3>
        <span className="badge badge-gold">{colVendors.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {colVendors.map((v) => (
          <VendorCard key={v.id} vendor={v} currency={currency} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function VendorForm({
  onAdd,
}: {
  readonly onAdd: (name: string, cat: BudgetCategory, amount: string) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('catering');
  const [quotedAmount, setQuotedAmount] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), category, quotedAmount);
    setName('');
    setQuotedAmount('');
  };
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

export function VendorChecklist(props: VendorChecklistProps): React.JSX.Element {
  const {
    vendors,
    currency,
    onAddVendor,
    onUpdateStatus,
    onRegenerateAI,
    isLoadingAI = false,
    pendingSuggestions,
    onAcceptSuggestions,
    onDismissSuggestions,
  } = props;
  const totalCommitment = calculateVendorTotalCommitment(vendors);

  return (
    <section id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Vendor Procurement Board</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Committed quotes: {currency} {totalCommitment.toLocaleString()}
          </p>
        </div>
        {onRegenerateAI && (
          <Button
            onClick={onRegenerateAI}
            isLoading={isLoadingAI}
            variant="outline"
            size="sm"
            leftIcon={<Sparkles size={16} />}
            id="btn-regenerate-vendors"
          >
            Regenerate Vendors
          </Button>
        )}
      </div>
      {isLoadingAI && <CardSkeleton />}
      {pendingSuggestions &&
        pendingSuggestions.length > 0 &&
        onAcceptSuggestions &&
        onDismissSuggestions && (
          <VendorSuggestionsAlert
            suggestions={pendingSuggestions}
            onAccept={onAcceptSuggestions}
            onDismiss={onDismissSuggestions}
          />
        )}
      <VendorForm
        onAdd={(name, cat, amount) =>
          onAddVendor({
            id: `v-${Date.now()}`,
            category: cat,
            name,
            status: 'shortlisted',
            quotedAmount: Number(amount) || 0,
            deliverables: ['Contract Review'],
          })
        }
      />
      {vendors.length === 0 ? (
        <EmptyState
          title="No Vendors Onboarded"
          description="Add vendors manually or click 'Regenerate Vendors' to get curated recommendations."
          actionLabel={onRegenerateAI ? 'Auto-Recommend Vendors' : undefined}
          onAction={onRegenerateAI}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {(['shortlisted', 'booked', 'paid'] as const).map((s) => (
            <VendorBoardColumn
              key={s}
              status={s}
              vendors={vendors}
              currency={currency}
              onUpdate={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </section>
  );
}
