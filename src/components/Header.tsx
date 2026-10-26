'use client';

import React from 'react';
import { EventPlan, EventType } from '@/domain/types';
import {
  Sparkles,
  Calendar,
  Users,
  IndianRupee,
  Share2,
  Printer,
  CalendarPlus,
} from 'lucide-react';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';

export interface HeaderProps {
  readonly plan: EventPlan;
  readonly onEventTypeChange: (type: EventType) => void;
  readonly onOpenWizard: () => void;
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
  readonly saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
}

const META_ITEM_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: 'var(--text-secondary)',
};

const META_ACTIONS = [
  { id: 'btn-export-ics', label: 'Export ICS', icon: CalendarPlus, actionKey: 'ics' as const },
  { id: 'btn-export-pdf', label: 'Print / PDF', icon: Printer, actionKey: 'pdf' as const },
  { id: 'btn-share-link', label: 'Share Link', icon: Share2, actionKey: 'share' as const },
];

function HeaderBrand({ title }: { readonly title: string }): React.JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Sparkles size={24} color="#f59e0b" aria-hidden="true" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Utsava: {title}
        </h1>
        <span
          role="status"
          aria-label="Demo mode active with MockProvider"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-gold)',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <Sparkles size={12} color="var(--accent-gold)" aria-hidden="true" />
          <span>Demo Mode (MockProvider)</span>
        </span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
        GenAI-powered planning assistant for life&apos;s most cherished gatherings.
      </p>
    </div>
  );
}

function HeaderControls({
  eventType,
  onEventTypeChange,
  onOpenWizard,
}: {
  readonly eventType: EventType;
  readonly onEventTypeChange: (type: EventType) => void;
  readonly onOpenWizard: () => void;
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button
        variant="primary"
        onClick={onOpenWizard}
        leftIcon={<Sparkles size={16} />}
        id="btn-open-wizard"
      >
        Plan New Event
      </Button>
      <ThemeToggle />
      <label htmlFor="event-type-select" className="sr-only">
        Demo Event Selector
      </label>
      <select
        id="event-type-select"
        className="select"
        value={eventType}
        onChange={(e) => onEventTypeChange(e.target.value as EventType)}
        style={{ width: 'auto', fontWeight: 600 }}
        aria-label="Switch between realistic demo events"
      >
        <option value="wedding">Indian Royal Wedding</option>
        <option value="birthday">Child&apos;s Safari Birthday</option>
        <option value="community">Neighborhood Fundraiser</option>
      </select>
    </div>
  );
}

function HeaderSaveStatusIndicator({
  status,
}: {
  readonly status: 'saved' | 'saving' | 'unsaved' | 'error';
}): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        color: status === 'saving' ? 'var(--accent-gold)' : 'var(--accent-emerald)',
        fontWeight: 500,
      }}
    >
      <span>{status === 'saving' ? '⏳' : '✓'}</span>
      <span>{status === 'saving' ? 'Saving...' : 'Saved'}</span>
    </div>
  );
}

function HeaderMetaDetails({
  plan,
  saveStatus,
}: {
  readonly plan: EventPlan;
  readonly saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div style={META_ITEM_STYLE}>
        <Calendar size={16} aria-hidden="true" />
        <span>{plan.date}</span>
      </div>
      <div style={META_ITEM_STYLE}>
        <Users size={16} aria-hidden="true" />
        <span>{plan.guestCount} Guests</span>
      </div>
      <div style={META_ITEM_STYLE}>
        <IndianRupee size={16} aria-hidden="true" />
        <span>
          {plan.currency} {plan.totalBudget.toLocaleString()}
        </span>
      </div>
      {saveStatus && <HeaderSaveStatusIndicator status={saveStatus} />}
    </div>
  );
}

function HeaderMetaActions({
  onExportICS,
  onExportPDF,
  onShareLink,
}: {
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
}): React.JSX.Element {
  const handlers = { ics: onExportICS, pdf: onExportPDF, share: onShareLink };
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {META_ACTIONS.map(({ id, label, icon: Icon, actionKey }) => (
        <Button
          key={id}
          variant="outline"
          size="sm"
          onClick={handlers[actionKey]}
          leftIcon={<Icon size={14} />}
          id={id}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

function HeaderMeta({
  plan,
  onExportICS,
  onExportPDF,
  onShareLink,
  saveStatus,
}: {
  readonly plan: EventPlan;
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
  readonly saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginTop: '20px',
        flexWrap: 'wrap',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '16px',
      }}
    >
      <HeaderMetaDetails plan={plan} saveStatus={saveStatus} />
      <HeaderMetaActions
        onExportICS={onExportICS}
        onExportPDF={onExportPDF}
        onShareLink={onShareLink}
      />
    </div>
  );
}

export function Header(props: HeaderProps): React.JSX.Element {
  return (
    <header className="card" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <HeaderBrand title={props.plan.title} />
        <HeaderControls
          eventType={props.plan.eventType}
          onEventTypeChange={props.onEventTypeChange}
          onOpenWizard={props.onOpenWizard}
        />
      </div>
      <HeaderMeta
        plan={props.plan}
        onExportICS={props.onExportICS}
        onExportPDF={props.onExportPDF}
        onShareLink={props.onShareLink}
        saveStatus={props.saveStatus}
      />
    </header>
  );
}
