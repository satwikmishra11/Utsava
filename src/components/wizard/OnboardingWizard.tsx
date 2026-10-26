'use client';

import React from 'react';
import { Dialog } from '../ui/Dialog';
import { OnboardingWizardProps } from './types';
import { useOnboardingWizard } from './useOnboardingWizard';
import { WizardProgressBar } from './WizardProgressBar';
import { WizardStepContent } from './WizardStepContent';
import { WizardActions } from './WizardActions';

export function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
}: OnboardingWizardProps): React.JSX.Element | null {
  const wizard = useOnboardingWizard(onComplete, onClose);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Event Setup — Step ${wizard.step} of 5`}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          wizard.handleNext();
        }}
        className="wizard-form"
      >
        <WizardProgressBar step={wizard.step} />
        <WizardStepContent wizard={wizard} />
        {wizard.error && (
          <div
            id="wizard-error-summary"
            role="alert"
            aria-live="assertive"
            className="wizard-error-summary"
          >
            {wizard.error}
          </div>
        )}
        <WizardActions step={wizard.step} onBack={wizard.handleBack} />
      </form>
    </Dialog>
  );
}
