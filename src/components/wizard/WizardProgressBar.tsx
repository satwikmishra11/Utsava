import React from 'react';

export interface WizardProgressBarProps {
  readonly step: number;
}

export function WizardProgressBar({ step }: WizardProgressBarProps): React.JSX.Element {
  return (
    <div
      role="progressbar"
      aria-label="Setup progress"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={5}
      style={{
        height: '6px',
        width: '100%',
        background: 'var(--bg-secondary)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${(step / 5) * 100}%`,
          background: 'var(--accent-gold)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}
