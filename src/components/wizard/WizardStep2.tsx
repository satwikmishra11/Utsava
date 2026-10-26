import React from 'react';
import { Input } from '../ui/Input';

export interface WizardStep2Props {
  readonly title: string;
  readonly setTitle: (v: string) => void;
  readonly date: string;
  readonly setDate: (v: string) => void;
  readonly location: string;
  readonly setLocation: (v: string) => void;
  readonly titleError?: string;
  readonly dateError?: string;
}

export function WizardStep2({
  title,
  setTitle,
  date,
  setDate,
  location,
  setLocation,
  titleError,
  dateError,
}: WizardStep2Props): React.JSX.Element {
  return (
    <div className="wizard-form-grid">
      <Input
        label="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        id="wizard-title"
        error={titleError}
        required
      />
      <Input
        label="Event Date (YYYY-MM-DD)"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        id="wizard-date"
        error={dateError}
        required
      />
      <Input
        label="Location / City"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        id="wizard-location"
      />
    </div>
  );
}
