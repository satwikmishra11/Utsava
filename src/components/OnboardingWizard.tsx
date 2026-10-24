'use client';

import React, { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { EventType } from '@/domain/schemas';
import { Heart, Cake, Users, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export interface WizardData {
  readonly eventType: EventType;
  readonly title: string;
  readonly date: string;
  readonly location: string;
  readonly guestCount: number;
  readonly totalBudget: number;
  readonly currency: string;
  readonly culture: string;
  readonly dietary: readonly string[];
  readonly accessibilityNeeds: readonly string[];
}

export interface OnboardingWizardProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onComplete: (data: WizardData) => void;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Nut-Free',
  'Gluten-Free',
] as const;
const ACCESSIBILITY_OPTIONS = [
  'Wheelchair Ramp',
  'ASL Interpreter',
  'Quiet Sensory Room',
  'Accessible Parking',
] as const;

function WizardStep1({
  value,
  onChange,
}: {
  readonly value: EventType;
  readonly onChange: (t: EventType) => void;
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontWeight: 600 }}>What type of celebration are you planning?</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {(['wedding', 'birthday', 'community'] as const).map((type) => {
          const isSel = value === type;
          return (
            <button
              key={type}
              type="button"
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
              {type === 'wedding' && <Heart size={24} color="var(--accent-gold)" />}
              {type === 'birthday' && <Cake size={24} color="var(--accent-gold)" />}
              {type === 'community' && <Users size={24} color="var(--accent-gold)" />}
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{type}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WizardStep2({
  title,
  setTitle,
  date,
  setDate,
  location,
  setLocation,
}: {
  readonly title: string;
  readonly setTitle: (v: string) => void;
  readonly date: string;
  readonly setDate: (v: string) => void;
  readonly location: string;
  readonly setLocation: (v: string) => void;
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input
        label="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        id="wizard-title"
        required
      />
      <Input
        label="Event Date (YYYY-MM-DD)"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        id="wizard-date"
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

function WizardStep3({
  guestCount,
  setGuestCount,
}: {
  readonly guestCount: string;
  readonly setGuestCount: (v: string) => void;
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input
        label="Expected Guest Count"
        type="number"
        min="1"
        value={guestCount}
        onChange={(e) => setGuestCount(e.target.value)}
        id="wizard-guests"
        required
      />
    </div>
  );
}

function WizardStep4({
  totalBudget,
  setTotalBudget,
  currency,
  setCurrency,
}: {
  readonly totalBudget: string;
  readonly setTotalBudget: (v: string) => void;
  readonly currency: string;
  readonly setCurrency: (v: string) => void;
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input
        label="Total Target Budget"
        type="number"
        min="100"
        value={totalBudget}
        onChange={(e) => setTotalBudget(e.target.value)}
        id="wizard-budget"
        required
      />
      <label htmlFor="wizard-currency" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
        Currency
      </label>
      <select
        id="wizard-currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="select"
      >
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="GBP">GBP (£)</option>
        <option value="INR">INR (₹)</option>
        <option value="CAD">CAD ($)</option>
      </select>
    </div>
  );
}

function WizardStep5({
  culture,
  setCulture,
  dietary,
  setDietary,
  accessibility,
  setAccessibility,
}: {
  readonly culture: string;
  readonly setCulture: (v: string) => void;
  readonly dietary: readonly string[];
  readonly setDietary: React.Dispatch<React.SetStateAction<string[]>>;
  readonly accessibility: readonly string[];
  readonly setAccessibility: React.Dispatch<React.SetStateAction<string[]>>;
}): React.JSX.Element {
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
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
          Dietary Restrictions
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DIETARY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggle(dietary, setDietary, d)}
              className={`btn ${dietary.includes(d) ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
          Accessibility Needs
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ACCESSIBILITY_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggle(accessibility, setAccessibility, a)}
              className={`btn ${accessibility.includes(a) ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function validateWizardStep(
  step: number,
  values: {
    readonly title: string;
    readonly date: string;
    readonly guestCount: string;
    readonly totalBudget: string;
  }
): string | null {
  if (step === 2 && (!values.title.trim() || !values.date.trim())) {
    return 'Please provide an event title and a valid date (YYYY-MM-DD).';
  }
  if (step === 3 && (Number(values.guestCount) <= 0 || isNaN(Number(values.guestCount)))) {
    return 'Please provide a positive guest count.';
  }
  if (step === 4 && (Number(values.totalBudget) <= 0 || isNaN(Number(values.totalBudget)))) {
    return 'Please provide a valid total budget amount.';
  }
  return null;
}

function WizardActions({
  step,
  onBack,
}: {
  readonly step: number;
  readonly onBack: () => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
      }}
    >
      {step > 1 ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          leftIcon={<ArrowLeft size={16} />}
          id="btn-wizard-back"
        >
          Back
        </Button>
      ) : (
        <div />
      )}
      <Button
        type="submit"
        variant="primary"
        rightIcon={step === 5 ? <Sparkles size={16} /> : <ArrowRight size={16} />}
        id="btn-wizard-next"
      >
        {step === 5 ? 'Create Event Plan' : 'Next Step'}
      </Button>
    </div>
  );
}

export function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
}: OnboardingWizardProps): React.JSX.Element | null {
  const [step, setStep] = useState<number>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('Grand Wedding Celebration');
  const [date, setDate] = useState('2026-11-20');
  const [location, setLocation] = useState('San Francisco, CA');
  const [guestCount, setGuestCount] = useState<string>('150');
  const [totalBudget, setTotalBudget] = useState<string>('30000');
  const [currency, setCurrency] = useState('USD');
  const [culture, setCulture] = useState('South Asian');
  const [dietary, setDietary] = useState<string[]>(['Vegetarian']);
  const [accessibility, setAccessibility] = useState<string[]>(['Wheelchair Ramp']);
  const [error, setError] = useState<string>('');

  const submitFinal = () => {
    onComplete({
      eventType,
      title: title.trim(),
      date,
      location: location.trim(),
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
      currency,
      culture: culture.trim(),
      dietary,
      accessibilityNeeds: accessibility,
    });
    onClose();
  };

  const handleNext = () => {
    const err = validateWizardStep(step, { title, date, guestCount, totalBudget });
    if (err) {
      setError(err);
      return;
    }
    setError('');
    if (step < 5) setStep((s) => s + 1);
    else submitFinal();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Event Setup — Step ${step} of 5`}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
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
        {step === 1 && (
          <WizardStep1
            value={eventType}
            onChange={(t) => {
              setEventType(t);
              setTitle(
                t === 'wedding'
                  ? 'Grand Wedding Celebration'
                  : t === 'birthday'
                    ? 'Birthday Milestone Bash'
                    : 'Annual Community Festival'
              );
            }}
          />
        )}
        {step === 2 && (
          <WizardStep2
            title={title}
            setTitle={setTitle}
            date={date}
            setDate={setDate}
            location={location}
            setLocation={setLocation}
          />
        )}
        {step === 3 && <WizardStep3 guestCount={guestCount} setGuestCount={setGuestCount} />}
        {step === 4 && (
          <WizardStep4
            totalBudget={totalBudget}
            setTotalBudget={setTotalBudget}
            currency={currency}
            setCurrency={setCurrency}
          />
        )}
        {step === 5 && (
          <WizardStep5
            culture={culture}
            setCulture={setCulture}
            dietary={dietary}
            setDietary={setDietary}
            accessibility={accessibility}
            setAccessibility={setAccessibility}
          />
        )}
        {error && (
          <p role="alert" style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
            {error}
          </p>
        )}
        <WizardActions step={step} onBack={() => setStep((s) => s - 1)} />
      </form>
    </Dialog>
  );
}
