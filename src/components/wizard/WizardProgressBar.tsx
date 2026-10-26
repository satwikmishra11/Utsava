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
      className="wizard-progress-track"
    >
      <div
        className="wizard-progress-fill"
        style={{
          width: `${(step / 5) * 100}%`,
        }}
      />
    </div>
  );
}
