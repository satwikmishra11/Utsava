'use client';

import React, { useRef } from 'react';
import { EventPlan } from '@/domain/types';
import { calculateBudgetSummary, calculatePerGuestCost } from '@/domain/budget';
import { calculateRunOfShowMetrics } from '@/domain/timeline';
import { calculateVendorFinancials } from '@/domain/vendors';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Printer, Copy, Download, Upload, Calendar, Users } from 'lucide-react';
import {
  copyToClipboard,
  exportBudgetToCSV,
  exportTimelineToCSV,
  exportVendorsToCSV,
  exportPlanToJSON,
  generateEventBriefText,
} from '@/lib/exportUtils';

export interface EventBriefDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly plan: EventPlan;
  readonly onImportJSON: (jsonString: string) => void;
  readonly showToast: (msg: string) => void;
}

function BriefMetadataSection({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '16px',
      }}
    >
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EVENT TYPE</span>
        <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{plan.eventType}</p>
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DATE</span>
        <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={14} aria-hidden="true" /> {plan.date}
        </p>
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GUEST COUNT</span>
        <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={14} aria-hidden="true" /> {plan.guestCount} Attendees
        </p>
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CULTURAL CONTEXT</span>
        <p style={{ fontWeight: 600 }}>{plan.culturalContext ?? 'Standard Custom'}</p>
      </div>
    </div>
  );
}

function BriefFinancialSnapshot({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  const summary = calculateBudgetSummary(plan.totalBudget, plan.budgetItems);
  const perGuest = calculatePerGuestCost(summary, plan.guestCount);
  const metrics = [
    { label: 'Target Budget', value: `${plan.currency} ${summary.totalBudget.toLocaleString()}` },
    { label: 'Committed Cost', value: `${plan.currency} ${summary.totalActual.toLocaleString()}` },
    {
      label: 'Cost Per Guest',
      value: `${plan.currency} ${perGuest.actualPerGuest.toLocaleString()} / head`,
    },
    { label: 'Remaining', value: `${plan.currency} ${summary.remainingBudget.toLocaleString()}` },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
        Financial Health & Per-Guest Allocation
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              padding: '10px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.label}</span>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefRunOfShowSection({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  const metrics = calculateRunOfShowMetrics(plan.timelineItems);
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Run of Show Master Schedule</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {plan.timelineItems.length} Milestones · Runtime: {metrics.formattedTotalRuntime}
        </span>
      </div>
      <div
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: 'var(--bg-secondary)',
                textAlign: 'left',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <th style={{ padding: '6px 10px' }}>Time</th>
              <th style={{ padding: '6px 10px' }}>Phase</th>
              <th style={{ padding: '6px 10px' }}>Milestone</th>
              <th style={{ padding: '6px 10px' }}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {plan.timelineItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>{item.time}</td>
                <td style={{ padding: '6px 10px', textTransform: 'capitalize' }}>{item.phase}</td>
                <td style={{ padding: '6px 10px' }}>{item.title}</td>
                <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                  {item.assignedTo ?? 'Organizer'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BriefVendorSummary({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  const fin = calculateVendorFinancials(plan.vendors);
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Vendor Procurement Directory</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {plan.vendors.length} Vendors · Balance Due: {plan.currency}{' '}
          {fin.balanceDue.toLocaleString()}
        </span>
      </div>
      <div
        style={{
          maxHeight: '160px',
          overflowY: 'auto',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: 'var(--bg-secondary)',
                textAlign: 'left',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <th style={{ padding: '6px 10px' }}>Vendor</th>
              <th style={{ padding: '6px 10px' }}>Category</th>
              <th style={{ padding: '6px 10px' }}>Status</th>
              <th style={{ padding: '6px 10px' }}>Quote</th>
            </tr>
          </thead>
          <tbody>
            {plan.vendors.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>{v.name}</td>
                <td style={{ padding: '6px 10px', textTransform: 'capitalize' }}>{v.category}</td>
                <td style={{ padding: '6px 10px' }}>
                  <span className={`badge ${v.status === 'paid' ? 'badge-emerald' : 'badge-gold'}`}>
                    {v.status}
                  </span>
                </td>
                <td style={{ padding: '6px 10px' }}>
                  {plan.currency} {v.quotedAmount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function handleFileUpload(
  file: File,
  onImport: (content: string) => void,
  onClose: () => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result;
    if (typeof content === 'string') {
      onImport(content);
      onClose();
    }
  };
  reader.readAsText(file);
}

function useBriefActions(plan: EventPlan, showToast: (msg: string) => void) {
  const handleCopyText = async () => {
    const text = generateEventBriefText(plan);
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Event brief copied to clipboard!' : 'Unable to copy brief.');
  };

  const handleExportAll = () => {
    exportBudgetToCSV(plan);
    exportTimelineToCSV(plan);
    exportVendorsToCSV(plan);
    showToast('Exported complete event package (3 CSVs).');
  };

  return { handleCopyText, handleExportAll };
}

function BriefActionButtons(props: {
  readonly plan: EventPlan;
  readonly showToast: (msg: string) => void;
  readonly onImportJSON: (jsonString: string) => void;
  readonly onClose: () => void;
}): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleCopyText, handleExportAll } = useBriefActions(props.plan, props.showToast);

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '16px',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, props.onImportJSON, props.onClose);
        }}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        leftIcon={<Upload size={14} />}
      >
        Import Backup
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => exportPlanToJSON(props.plan)}
        leftIcon={<Download size={14} />}
      >
        Backup JSON
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExportAll}
        leftIcon={<Download size={14} />}
      >
        Export All CSVs
      </Button>
      <Button variant="secondary" size="sm" onClick={handleCopyText} leftIcon={<Copy size={14} />}>
        Copy Text
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => window.print()}
        leftIcon={<Printer size={14} />}
      >
        Print Brief (PDF)
      </Button>
    </div>
  );
}

export function EventBriefDialog(props: EventBriefDialogProps): React.JSX.Element | null {
  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={`Event Master Brief: ${props.plan.title}`}
      maxWidth="800px"
    >
      <div style={{ padding: '12px 0 0 0' }}>
        <BriefMetadataSection plan={props.plan} />
        <BriefFinancialSnapshot plan={props.plan} />
        <BriefRunOfShowSection plan={props.plan} />
        <BriefVendorSummary plan={props.plan} />
        <BriefActionButtons
          plan={props.plan}
          showToast={props.showToast}
          onImportJSON={props.onImportJSON}
          onClose={props.onClose}
        />
      </div>
    </Dialog>
  );
}
