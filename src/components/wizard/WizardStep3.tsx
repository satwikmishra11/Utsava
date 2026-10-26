import React from 'react';
import { Input } from '../ui/Input';

export interface WizardStep3Props {
  readonly guestCount: string;
  readonly setGuestCount: (v: string) => void;
  readonly guestError?: string;
}

export function WizardStep3({
  guestCount,
  setGuestCount,
  guestError,
}: WizardStep3Props): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input
        label="Expected Guest Count"
        type="number"
        min="1"
        value={guestCount}
        onChange={(e) => setGuestCount(e.target.value)}
        id="wizard-guests"
        error={guestError}
        required
      />
    </div>
  );
}
