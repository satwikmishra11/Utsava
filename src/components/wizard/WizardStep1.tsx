import React from 'react';
import { EventType } from '@/domain/schemas';
import { Heart, Cake, Users } from 'lucide-react';

export interface WizardStep1Props {
  readonly value: EventType;
  readonly onChange: (t: EventType) => void;
}

const EVENT_TYPES = [
  { type: 'wedding', icon: Heart },
  { type: 'birthday', icon: Cake },
  { type: 'community', icon: Users },
] as const;

export function WizardStep1({ value, onChange }: WizardStep1Props): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontWeight: 600 }}>What type of celebration are you planning?</p>
      <div
        aria-label="Celebration event type"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}
      >
        {EVENT_TYPES.map(({ type, icon: Icon }) => {
          const isSel = value === type;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={isSel}
              id={`wizard-type-${type}`}
              onClick={() => onChange(type)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '18px 12px',
                borderRadius: 'var(--radius-sm)',
                border: isSel ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                background: isSel ? 'var(--bg-surface-elevated)' : 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <Icon size={24} color="var(--accent-gold)" aria-hidden="true" />
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{type}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
