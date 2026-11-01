'use client';

import React, { useState } from 'react';
import { CreditCard, ChevronDown, ChevronUp, Clock, CheckCircle2 } from 'lucide-react';
import { VendorItem } from '@/domain/types';
import {
  calculateVendorCashFlowSummary,
  VendorMilestone,
  MilestoneStatus,
} from '@/domain/vendorMilestones';

interface VendorPaymentScheduleProps {
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
}

const PILL_CONFIGS: Record<
  MilestoneStatus,
  {
    className: string;
    label: string;
    icon?: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
    style: React.CSSProperties;
  }
> = {
  paid: {
    className: 'badge badge-success',
    label: 'Settled',
    icon: CheckCircle2,
    style: {
      background: '#dcfce7',
      color: '#166534',
      display: 'inline-flex',
      gap: '4px',
      alignItems: 'center',
    },
  },
  due_soon: {
    className: 'badge badge-warning',
    label: 'Due in 14d',
    icon: Clock,
    style: {
      background: '#fef3c7',
      color: '#92400e',
      display: 'inline-flex',
      gap: '4px',
      alignItems: 'center',
    },
  },
  scheduled: {
    className: 'badge',
    label: 'Day-Of',
    style: { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
  },
  tentative: {
    className: 'badge',
    label: 'Tentative',
    style: { background: 'var(--bg-secondary)', color: 'var(--text-muted)' },
  },
};

function MilestoneStatusPill({ status }: { readonly status: MilestoneStatus }): React.JSX.Element {
  const cfg = PILL_CONFIGS[status];
  const Icon = cfg.icon;
  return (
    <span className={cfg.className} style={cfg.style}>
      {Icon && <Icon size={12} aria-hidden={true} />} {cfg.label}
    </span>
  );
}

const CARD_STYLE = {
  padding: '10px',
  borderRadius: '6px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
} as const;

function CashFlowCard({
  label,
  value,
  color,
}: {
  readonly label: string;
  readonly value: string;
  readonly color?: string;
}): React.JSX.Element {
  return (
    <div style={CARD_STYLE}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: color ?? 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function MilestoneKpiRow({
  summary,
  currency,
}: {
  readonly summary: ReturnType<typeof calculateVendorCashFlowSummary>;
  readonly currency: string;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        marginTop: '12px',
      }}
    >
      <CashFlowCard
        label="Total Committed Contracts"
        value={`${currency} ${summary.totalCommitted.toLocaleString()}`}
      />
      <CashFlowCard
        label="Retainers Settled"
        value={`${currency} ${summary.totalPaid.toLocaleString()}`}
        color="#166534"
      />
      <CashFlowCard
        label="Imminent Liabilities (14d)"
        value={`${currency} ${summary.imminentDueAmount.toLocaleString()}`}
        color="var(--accent-gold)"
      />
      <CashFlowCard
        label="Pending Day-of Settlement"
        value={`${currency} ${summary.totalPending.toLocaleString()}`}
      />
    </div>
  );
}

function MilestoneRow({
  milestone,
  currency,
}: {
  readonly milestone: VendorMilestone;
  readonly currency: string;
}): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '8px', fontWeight: 600 }}>{milestone.vendorName}</td>
      <td style={{ padding: '8px' }}>
        {milestone.title} ({milestone.percentage}%)
      </td>
      <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
        {milestone.dueDateDescription}
      </td>
      <td style={{ padding: '8px', fontWeight: 600 }}>
        {currency} {milestone.amount.toLocaleString()}
      </td>
      <td style={{ padding: '8px' }}>
        <MilestoneStatusPill status={milestone.status} />
      </td>
    </tr>
  );
}

function MilestoneTable({
  milestones,
  currency,
}: {
  readonly milestones: readonly VendorMilestone[];
  readonly currency: string;
}): React.JSX.Element {
  if (milestones.length === 0) {
    return (
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '12px' }}>
        No payment milestones found for active vendors.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: '12px' }}>
      <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th scope="col" style={{ padding: '8px' }}>
              Vendor
            </th>
            <th scope="col" style={{ padding: '8px' }}>
              Milestone Stage
            </th>
            <th scope="col" style={{ padding: '8px' }}>
              Due Window
            </th>
            <th scope="col" style={{ padding: '8px' }}>
              Installment Amount
            </th>
            <th scope="col" style={{ padding: '8px' }}>
              Cash Flow Status
            </th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <MilestoneRow key={m.id} milestone={m} currency={currency} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TOGGLE_STYLE = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  background: 'transparent',
} as const;

function ScheduleToggle({
  isOpen,
  onToggle,
}: {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      id="btn-toggle-payment-schedule"
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="payment-schedule-content"
      className="btn"
      style={TOGGLE_STYLE}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        <CreditCard size={16} aria-hidden={true} style={{ color: 'var(--accent-gold)' }} />
        <span>Vendor Payment Schedule & Cash Flow Milestones</span>
      </span>
      {isOpen ? (
        <ChevronUp size={16} aria-hidden={true} />
      ) : (
        <ChevronDown size={16} aria-hidden={true} />
      )}
    </button>
  );
}

export function VendorPaymentSchedule({
  vendors,
  currency,
}: VendorPaymentScheduleProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const summary = calculateVendorCashFlowSummary(vendors);

  return (
    <div
      style={{
        margin: '14px 0',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        background: 'var(--bg-primary)',
      }}
    >
      <ScheduleToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <div
          id="payment-schedule-content"
          style={{ padding: '0 14px 14px 14px', borderTop: '1px solid var(--border)' }}
        >
          <MilestoneKpiRow summary={summary} currency={currency} />
          <MilestoneTable milestones={summary.milestones} currency={currency} />
        </div>
      )}
    </div>
  );
}
