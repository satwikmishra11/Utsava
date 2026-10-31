'use client';

import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { EventPlan } from '@/domain/types';

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
  padding: '16px',
  background: 'var(--bg-secondary)',
  borderRadius: 'var(--radius-sm)',
  marginBottom: '16px',
};

function MetaField({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ fontWeight: 600, marginTop: '2px' }}>{children}</div>
    </div>
  );
}

export function BriefMetadataSection({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  return (
    <div style={GRID_STYLE}>
      <MetaField label="EVENT TYPE">
        <span style={{ textTransform: 'capitalize' }}>{plan.eventType}</span>
      </MetaField>
      <MetaField label="DATE">
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={14} aria-hidden="true" /> {plan.date}
        </span>
      </MetaField>
      <MetaField label="GUEST COUNT">
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={14} aria-hidden="true" /> {plan.guestCount} Attendees
        </span>
      </MetaField>
      <MetaField label="CULTURAL CONTEXT">
        <span>{plan.culturalContext ?? 'Standard Custom'}</span>
      </MetaField>
    </div>
  );
}
