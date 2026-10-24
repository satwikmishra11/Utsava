'use client';

import React from 'react';
import { EventPlan, EventType } from '@/domain/types';
import { Sparkles, Calendar, Users, DollarSign } from 'lucide-react';

interface HeaderProps {
  readonly plan: EventPlan;
  readonly onEventTypeChange: (type: EventType) => void;
}

export function Header({ plan, onEventTypeChange }: HeaderProps): React.JSX.Element {
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} color="#f59e0b" aria-hidden="true" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Utsava: {plan.title}
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
            GenAI-powered planning assistant for life&apos;s most cherished gatherings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label htmlFor="event-type-select" className="sr-only">
            Event Type
          </label>
          <select
            id="event-type-select"
            className="select"
            value={plan.eventType}
            onChange={(e) => onEventTypeChange(e.target.value as EventType)}
            style={{ width: 'auto', fontWeight: 600 }}
          >
            <option value="wedding">Wedding Celebration</option>
            <option value="birthday">Milestone Birthday</option>
            <option value="community">Community & Cultural Festival</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '20px',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
          }}
        >
          <Calendar size={18} aria-hidden="true" />
          <span>{plan.date}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
          }}
        >
          <Users size={18} aria-hidden="true" />
          <span>{plan.guestCount} Guests</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
          }}
        >
          <DollarSign size={18} aria-hidden="true" />
          <span>
            Budget: {plan.currency} {plan.totalBudget.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
}
