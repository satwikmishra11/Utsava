import { useState } from 'react';
import { EventType } from '@/domain/schemas';
import { WizardData } from './types';

function validateStep(
  step: number,
  title: string,
  date: string,
  guestCount: string,
  totalBudget: string
): string | null {
  if (step === 2 && (!title.trim() || !date.trim())) {
    return 'Please provide an event title and a valid date (YYYY-MM-DD).';
  }
  if (step === 3 && (Number(guestCount) <= 0 || isNaN(Number(guestCount)))) {
    return 'Please provide a positive guest count.';
  }
  if (step === 4 && (Number(totalBudget) <= 0 || isNaN(Number(totalBudget)))) {
    return 'Please provide a valid total budget amount.';
  }
  return null;
}

function useWizardDetailsState() {
  const [title, setTitle] = useState('Grand Wedding Celebration');
  const [date, setDate] = useState('2026-11-20');
  const [location, setLocation] = useState('San Francisco, CA');
  const [guestCount, setGuestCount] = useState<string>('150');
  const [totalBudget, setTotalBudget] = useState<string>('30000');
  const [currency, setCurrency] = useState('INR');
  return {
    title,
    setTitle,
    date,
    setDate,
    location,
    setLocation,
    guestCount,
    setGuestCount,
    totalBudget,
    setTotalBudget,
    currency,
    setCurrency,
  };
}

function useWizardFormState() {
  const [step, setStep] = useState<number>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [culture, setCulture] = useState('South Asian');
  const [dietary, setDietary] = useState<string[]>(['Vegetarian']);
  const [accessibility, setAccessibility] = useState<string[]>(['Wheelchair Ramp']);
  const [customAccessibility, setCustomAccessibility] = useState<string>('');
  const [error, setError] = useState<string>('');
  const details = useWizardDetailsState();
  return {
    step,
    setStep,
    eventType,
    setEventType,
    culture,
    setCulture,
    dietary,
    setDietary,
    accessibility,
    setAccessibility,
    customAccessibility,
    setCustomAccessibility,
    error,
    setError,
    ...details,
  };
}

function buildWizardData(state: ReturnType<typeof useWizardFormState>): WizardData {
  const custom = state.customAccessibility.trim();
  const customList = custom
    ? custom
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const mergedAccessibility = Array.from(new Set([...state.accessibility, ...customList]));
  return {
    eventType: state.eventType,
    title: state.title.trim(),
    date: state.date,
    location: state.location.trim(),
    guestCount: Number(state.guestCount),
    totalBudget: Number(state.totalBudget),
    currency: state.currency,
    culture: state.culture.trim(),
    dietary: state.dietary,
    accessibilityNeeds: mergedAccessibility,
  };
}

const DEFAULT_TITLES: Record<EventType, string> = {
  wedding: 'Grand Wedding Celebration',
  birthday: 'Birthday Milestone Bash',
  community: 'Annual Community Festival',
};

export function useOnboardingWizard(onComplete: (data: WizardData) => void, onClose: () => void) {
  const s = useWizardFormState();

  const handleNext = () => {
    const err = validateStep(s.step, s.title, s.date, s.guestCount, s.totalBudget);
    if (err) {
      s.setError(err);
      return;
    }
    s.setError('');
    if (s.step < 5) s.setStep((step) => step + 1);
    else {
      onComplete(buildWizardData(s));
      onClose();
    }
  };

  const handleEventTypeChange = (t: EventType) => {
    s.setEventType(t);
    s.setTitle(DEFAULT_TITLES[t]);
  };

  return {
    ...s,
    handleNext,
    handleBack: () => s.setStep((step) => step - 1),
    handleEventTypeChange,
  };
}
