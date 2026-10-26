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

export function useOnboardingWizard(onComplete: (data: WizardData) => void, onClose: () => void) {
  const [step, setStep] = useState<number>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('Grand Wedding Celebration');
  const [date, setDate] = useState('2026-11-20');
  const [location, setLocation] = useState('San Francisco, CA');
  const [guestCount, setGuestCount] = useState<string>('150');
  const [totalBudget, setTotalBudget] = useState<string>('30000');
  const [currency, setCurrency] = useState('INR');
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
    const err = validateStep(step, title, date, guestCount, totalBudget);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    if (step < 5) setStep((s) => s + 1);
    else submitFinal();
  };

  const handleEventTypeChange = (t: EventType) => {
    setEventType(t);
    setTitle(
      t === 'wedding'
        ? 'Grand Wedding Celebration'
        : t === 'birthday'
          ? 'Birthday Milestone Bash'
          : 'Annual Community Festival'
    );
  };

  return {
    step,
    setStep,
    eventType,
    handleEventTypeChange,
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
    culture,
    setCulture,
    dietary,
    setDietary,
    accessibility,
    setAccessibility,
    error,
    handleNext,
    handleBack: () => setStep((s) => s - 1),
  };
}
