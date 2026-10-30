'use client';

import React from 'react';
import { EventPlan } from '@/domain/types';
import { EventType } from '@/domain/schemas';
import {
  Sparkles,
  Calendar,
  Users,
  IndianRupee,
  Share2,
  Printer,
  CalendarPlus,
  FileText,
} from 'lucide-react';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';

export interface HeaderProps {
  readonly plan: EventPlan;
  readonly onEventTypeChange: (type: EventType) => void;
  readonly onOpenWizard: () => void;
  readonly onOpenBrief?: () => void;
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
  readonly saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
}

const META_ACTIONS = [
  { id: 'btn-open-brief', label: 'Event Brief', icon: FileText, actionKey: 'brief' as const },
  { id: 'btn-export-ics', label: 'Export ICS', icon: CalendarPlus, actionKey: 'ics' as const },
  { id: 'btn-export-pdf', label: 'Print / PDF', icon: Printer, actionKey: 'pdf' as const },
  { id: 'btn-share-link', label: 'Share Link', icon: Share2, actionKey: 'share' as const },
];

function HeaderBrand({ title }: { readonly title: string }): React.JSX.Element {
  return (
    <div>
      <div className="header-brand-row">
        <Sparkles size={24} color="#f59e0b" aria-hidden="true" />
        <h1 className="header-title">Utsava: {title}</h1>
        <span
          role="status"
          aria-label="Demo mode active with MockProvider"
          className="header-demo-badge"
        >
          <Sparkles size={12} color="var(--accent-gold)" aria-hidden="true" />
          <span>Demo Mode (MockProvider)</span>
        </span>
      </div>
      <p className="header-subtitle">
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
    <div className="header-controls">
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
        className="select header-event-select"
        value={eventType}
        onChange={(e) => onEventTypeChange(e.target.value as EventType)}
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
      className={`header-save-status ${
        status === 'saving' ? 'header-save-status-saving' : 'header-save-status-saved'
      }`}
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
    <div className="header-meta-details">
      <div className="header-meta-item">
        <Calendar size={16} aria-hidden="true" />
        <span>{plan.date}</span>
      </div>
      <div className="header-meta-item">
        <Users size={16} aria-hidden="true" />
        <span>{plan.guestCount} Guests</span>
      </div>
      <div className="header-meta-item">
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
  onOpenBrief,
  onExportICS,
  onExportPDF,
  onShareLink,
}: {
  readonly onOpenBrief?: () => void;
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
}): React.JSX.Element {
  const handlers = {
    brief: onOpenBrief ?? (() => {}),
    ics: onExportICS,
    pdf: onExportPDF,
    share: onShareLink,
  };
  const actions = onOpenBrief ? META_ACTIONS : META_ACTIONS.filter((a) => a.actionKey !== 'brief');
  return (
    <div className="header-meta-actions">
      {actions.map(({ id, label, icon: Icon, actionKey }) => (
        <Button
          key={id}
          variant={actionKey === 'brief' ? 'primary' : 'outline'}
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

function HeaderMeta(props: {
  readonly plan: EventPlan;
  readonly onOpenBrief?: () => void;
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
  readonly saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
}): React.JSX.Element {
  return (
    <div className="header-meta">
      <HeaderMetaDetails plan={props.plan} saveStatus={props.saveStatus} />
      <HeaderMetaActions
        onOpenBrief={props.onOpenBrief}
        onExportICS={props.onExportICS}
        onExportPDF={props.onExportPDF}
        onShareLink={props.onShareLink}
      />
    </div>
  );
}

export function Header(props: HeaderProps): React.JSX.Element {
  return (
    <header className="card header-card">
      <div className="header-top">
        <HeaderBrand title={props.plan.title} />
        <HeaderControls
          eventType={props.plan.eventType}
          onEventTypeChange={props.onEventTypeChange}
          onOpenWizard={props.onOpenWizard}
        />
      </div>
      <HeaderMeta
        plan={props.plan}
        onOpenBrief={props.onOpenBrief}
        onExportICS={props.onExportICS}
        onExportPDF={props.onExportPDF}
        onShareLink={props.onShareLink}
        saveStatus={props.saveStatus}
      />
    </header>
  );
}
