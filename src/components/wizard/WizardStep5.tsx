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
  readonly customAccessibility: string;
  readonly setCustomAccessibility: (v: string) => void;
}

function toggleListItem(
  list: readonly string[],
  setFn: React.Dispatch<React.SetStateAction<string[]>>,
  item: string
): void {
  setFn(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
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
      <p className="wizard-group-title">{title}</p>
      <div role="group" aria-label={ariaLabel} className="wizard-options-group">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={selected.includes(opt)}
            onClick={() => onToggle(opt)}
            className={`btn ${selected.includes(opt) ? 'btn-primary' : 'btn-secondary'} wizard-option-btn`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function AccessibilitySection({
  accessibility,
  setAccessibility,
  customAccessibility,
  setCustomAccessibility,
}: {
  readonly accessibility: readonly string[];
  readonly setAccessibility: React.Dispatch<React.SetStateAction<string[]>>;
  readonly customAccessibility: string;
  readonly setCustomAccessibility: (v: string) => void;
}): React.JSX.Element {
  return (
    <>
      <ToggleButtonGroup
        title="Accessibility Needs"
        ariaLabel="Accessibility options"
        options={ACCESSIBILITY_OPTIONS}
        selected={accessibility}
        onToggle={(a) => toggleListItem(accessibility, setAccessibility, a)}
      />
      <Input
        label="Additional Accessibility Needs (Optional)"
        id="wizard-accessibility-input"
        value={customAccessibility}
        onChange={(e) => setCustomAccessibility(e.target.value)}
        placeholder="e.g., Braille signage, service animal relief area"
      />
    </>
  );
}

export function WizardStep5(props: WizardStep5Props): React.JSX.Element {
  const { culture, setCulture, dietary, setDietary } = props;
  return (
    <div className="wizard-form-grid">
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
        onToggle={(d) => toggleListItem(dietary, setDietary, d)}
      />
      <AccessibilitySection
        accessibility={props.accessibility}
        setAccessibility={props.setAccessibility}
        customAccessibility={props.customAccessibility}
        setCustomAccessibility={props.setCustomAccessibility}
      />
    </div>
  );
}
