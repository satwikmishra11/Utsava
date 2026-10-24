'use client';

import React from 'react';
import { EventPlan, EventType } from '@/domain/types';
import { Sparkles, Calendar, Users, DollarSign, Share2, Printer, CalendarPlus } from 'lucide-react';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';

export interface HeaderProps {
  readonly plan: EventPlan;
  readonly onEventTypeChange: (type: EventType) => void;
  readonly onOpenWizard: () => void;
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
}

function HeaderBrand({ title }: { readonly title: string }): React.JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={24} color="#f59e0b" aria-hidden="true" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Utsava: {title}
        </h1>
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
        Event Type
      </label>
      <select
        id="event-type-select"
        className="select"
        value={eventType}
        onChange={(e) => onEventTypeChange(e.target.value as EventType)}
        style={{ width: 'auto', fontWeight: 600 }}
      >
        <option value="wedding">Wedding Celebration</option>
        <option value="birthday">Milestone Birthday</option>
        <option value="community">Community Festival</option>
      </select>
    </div>
  );
}

function HeaderMeta({
  plan,
  onExportICS,
  onExportPDF,
  onShareLink,
}: {
  readonly plan: EventPlan;
  readonly onExportICS: () => void;
  readonly onExportPDF: () => void;
  readonly onShareLink: () => void;
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
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
          }}
        >
          <Calendar size={16} aria-hidden="true" />
          <span>{plan.date}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
          }}
        >
          <Users size={16} aria-hidden="true" />
          <span>{plan.guestCount} Guests</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
          }}
        >
          <DollarSign size={16} aria-hidden="true" />
          <span>
            {plan.currency} {plan.totalBudget.toLocaleString()}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportICS}
          leftIcon={<CalendarPlus size={14} />}
          id="btn-export-ics"
        >
          Export ICS
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPDF}
          leftIcon={<Printer size={14} />}
          id="btn-export-pdf"
        >
          Print / PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShareLink}
          leftIcon={<Share2 size={14} />}
          id="btn-share-link"
        >
          Share Link
        </Button>
      </div>
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
      />
    </header>
  );
}
