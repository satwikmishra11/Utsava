import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingWizard } from '../wizard';

describe('OnboardingWizard Accessibility Needs Collection', () => {
  it('collects both toggle options and custom typed accessibility accommodations', () => {
    const onComplete = vi.fn();
    const onClose = vi.fn();

    render(<OnboardingWizard isOpen={true} onClose={onClose} onComplete={onComplete} />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /wedding/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 4 -> Step 5
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 5: Accessibility Needs
    const accessibilityInput = screen.getByLabelText(/additional accessibility needs/i);
    expect(accessibilityInput).toBeInTheDocument();
    expect(accessibilityInput.id).toBe('wizard-accessibility-input');

    // Type custom accessibility accommodation
    fireEvent.change(accessibilityInput, {
      target: { value: 'Braille signage, Tactile paving' },
    });

    // Complete wizard
    fireEvent.click(screen.getByRole('button', { name: /create event plan/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const call = onComplete.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call?.accessibilityNeeds).toContain('Wheelchair Ramp'); // default toggle
    expect(call?.accessibilityNeeds).toContain('Braille signage');
    expect(call?.accessibilityNeeds).toContain('Tactile paving');
  });
});
