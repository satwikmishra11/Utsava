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
    <div className="wizard-step-container">
      <p className="wizard-question">What type of celebration are you planning?</p>
      <div aria-label="Celebration event type" className="wizard-type-grid">
        {EVENT_TYPES.map(({ type, icon: Icon }) => {
          const isSel = value === type;
          const btnClass = `wizard-type-btn ${isSel ? 'wizard-type-btn-selected' : ''}`.trim();
          return (
            <button
              key={type}
              type="button"
              aria-pressed={isSel}
              id={`wizard-type-${type}`}
              onClick={() => onChange(type)}
              className={btnClass}
            >
              <Icon size={24} color="var(--accent-gold)" aria-hidden="true" />
              <span className="wizard-type-label">{type}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
