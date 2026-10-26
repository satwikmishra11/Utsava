import React from 'react';
import { Input } from '../ui/Input';

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Nut-Free',
  'Gluten-Free',
] as const;

export const ACCESSIBILITY_OPTIONS = [
  'Wheelchair Ramp',
  'ASL Interpreter',
  'Quiet Sensory Room',
  'Accessible Parking',
] as const;

export interface WizardStep5Props {
  readonly culture: string;
  readonly setCulture: (v: string) => void;
  readonly dietary: readonly string[];
  readonly setDietary: React.Dispatch<React.SetStateAction<string[]>>;
  readonly accessibility: readonly string[];
  readonly setAccessibility: React.Dispatch<React.SetStateAction<string[]>>;
}

function ToggleButtonGroup({
  title,
  ariaLabel,
  options,
  selected,
  onToggle,
}: {
  readonly title: string;
  readonly ariaLabel: string;
  readonly options: readonly string[];
  readonly selected: readonly string[];
  readonly onToggle: (item: string) => void;
}): React.JSX.Element {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>{title}</p>
      <div
        role="group"
        aria-label={ariaLabel}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
      >
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={selected.includes(opt)}
            onClick={() => onToggle(opt)}
            className={`btn ${selected.includes(opt) ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WizardStep5({
  culture,
  setCulture,
  dietary,
  setDietary,
  accessibility,
  setAccessibility,
}: WizardStep5Props): React.JSX.Element {
  const toggle = (
    list: readonly string[],
    setFn: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setFn(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input
        label="Cultural Context / Theme Tradition"
        value={culture}
        onChange={(e) => setCulture(e.target.value)}
        id="wizard-culture"
        placeholder="e.g., South Asian, Traditional, Modern"
      />
      <ToggleButtonGroup
        title="Dietary Restrictions"
        ariaLabel="Dietary restrictions"
        options={DIETARY_OPTIONS}
        selected={dietary}
        onToggle={(d) => toggle(dietary, setDietary, d)}
      />
      <ToggleButtonGroup
        title="Accessibility Needs"
        ariaLabel="Accessibility options"
        options={ACCESSIBILITY_OPTIONS}
        selected={accessibility}
        onToggle={(a) => toggle(accessibility, setAccessibility, a)}
      />
    </div>
  );
}
