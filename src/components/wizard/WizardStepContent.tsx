import React from 'react';
import { useOnboardingWizard } from './useOnboardingWizard';
import { WizardStep1 } from './WizardStep1';
import { WizardStep2 } from './WizardStep2';
import { WizardStep3 } from './WizardStep3';
import { WizardStep4 } from './WizardStep4';
import { WizardStep5 } from './WizardStep5';

export interface WizardStepContentProps {
  readonly wizard: ReturnType<typeof useOnboardingWizard>;
}

function renderEarlySteps(
  wizard: ReturnType<typeof useOnboardingWizard>
): React.JSX.Element | null {
  const { step, error } = wizard;
  if (step === 1) {
    return <WizardStep1 value={wizard.eventType} onChange={wizard.handleEventTypeChange} />;
  }
  if (step === 2) {
    return (
      <WizardStep2
        title={wizard.title}
        setTitle={wizard.setTitle}
        date={wizard.date}
        setDate={wizard.setDate}
        location={wizard.location}
        setLocation={wizard.setLocation}
        titleError={error && !wizard.title.trim() ? error : undefined}
        dateError={error && !wizard.date.trim() ? error : undefined}
      />
    );
  }
  return null;
}

export function WizardStepContent({ wizard }: WizardStepContentProps): React.JSX.Element | null {
  const { step, error } = wizard;
  if (step <= 2) return renderEarlySteps(wizard);

  if (step === 3) {
    const isInvalid = Number(wizard.guestCount) <= 0 || isNaN(Number(wizard.guestCount));
    return (
      <WizardStep3
        guestCount={wizard.guestCount}
        setGuestCount={wizard.setGuestCount}
        guestError={error && isInvalid ? error : undefined}
      />
    );
  }
  if (step === 4) {
    const isInvalid = Number(wizard.totalBudget) <= 0 || isNaN(Number(wizard.totalBudget));
    return (
      <WizardStep4
        totalBudget={wizard.totalBudget}
        setTotalBudget={wizard.setTotalBudget}
        currency={wizard.currency}
        setCurrency={wizard.setCurrency}
        budgetError={error && isInvalid ? error : undefined}
      />
    );
  }
  return (
    <WizardStep5
      culture={wizard.culture}
      setCulture={wizard.setCulture}
      dietary={wizard.dietary}
      setDietary={wizard.setDietary}
      accessibility={wizard.accessibility}
      setAccessibility={wizard.setAccessibility}
      customAccessibility={wizard.customAccessibility}
      setCustomAccessibility={wizard.setCustomAccessibility}
    />
  );
}
