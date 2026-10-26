import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface WizardActionsProps {
  readonly step: number;
  readonly onBack: () => void;
}

export function WizardActions({ step, onBack }: WizardActionsProps): React.JSX.Element {
  return (
    <div className="wizard-actions">
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
