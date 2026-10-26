import { EventType } from '@/domain/schemas';

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
