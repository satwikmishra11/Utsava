import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingWizard } from '../OnboardingWizard';

describe('OnboardingWizard Component Tests', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <OnboardingWizard isOpen={false} onClose={vi.fn()} onComplete={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders step 1 and navigates through all 5 steps to completion', async () => {
    const onComplete = vi.fn();
    const onClose = vi.fn();

    render(<OnboardingWizard isOpen={true} onClose={onClose} onComplete={onComplete} />);

    // Step 1: Select celebration type
    expect(screen.getByText(/What type of celebration are you planning\?/i)).toBeInTheDocument();
    const birthdayBtn = screen.getByRole('button', { name: /birthday/i });
    fireEvent.click(birthdayBtn);
    expect(birthdayBtn).toHaveAttribute('aria-pressed', 'true');

    // Click Next to advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Title and Date
    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    const titleInput = screen.getByLabelText(/event title/i);
    fireEvent.change(titleInput, { target: { value: "Rohan's 30th Birthday" } });

    const dateInput = screen.getByLabelText(/event date/i);
    fireEvent.change(dateInput, { target: { value: '2026-10-15' } });

    // Click Next to Step 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Guest count
    expect(screen.getByLabelText(/expected guest count/i)).toBeInTheDocument();
    const guestInput = screen.getByLabelText(/expected guest count/i);
    fireEvent.change(guestInput, { target: { value: '75' } });

    // Click Next to Step 4
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Budget & Currency
    expect(screen.getByLabelText(/total target budget/i)).toBeInTheDocument();
    const budgetInput = screen.getByLabelText(/total target budget/i);
    fireEvent.change(budgetInput, { target: { value: '8500' } });

    const currencySelect = screen.getByLabelText(/currency/i);
    fireEvent.change(currencySelect, { target: { value: 'USD' } });

    // Click Next to Step 5
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 5: Culture, Dietary & Accessibility
    expect(screen.getByLabelText(/cultural context/i)).toBeInTheDocument();
    const cultureInput = screen.getByLabelText(/cultural context/i);
    fireEvent.change(cultureInput, { target: { value: 'Casual Bollywood' } });

    // Toggle a dietary option
    const veganOption = screen.getByRole('checkbox', { name: /vegan/i });
    fireEvent.click(veganOption);
    expect(veganOption).toHaveAttribute('aria-checked', 'true');

    // Toggle an accessibility option
    const parkingOption = screen.getByRole('checkbox', { name: /accessible parking/i });
    fireEvent.click(parkingOption);
    expect(parkingOption).toHaveAttribute('aria-checked', 'true');

    // Finish wizard
    const finishBtn = screen.getByRole('button', { name: /create event plan/i });
    fireEvent.click(finishBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const completedData = onComplete.mock.calls[0][0];
    expect(completedData.eventType).toBe('birthday');
    expect(completedData.title).toBe("Rohan's 30th Birthday");
    expect(completedData.date).toBe('2026-10-15');
    expect(completedData.guestCount).toBe(75);
    expect(completedData.totalBudget).toBe(8500);
    expect(completedData.currency).toBe('USD');
    expect(completedData.culture).toBe('Casual Bollywood');
    expect(completedData.dietary).toContain('Vegan');
    expect(completedData.accessibilityNeeds).toContain('Accessible Parking');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('validates required fields on Step 2 and displays accessible alert', async () => {
    render(<OnboardingWizard isOpen={true} onClose={vi.fn()} onComplete={vi.fn()} />);

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Clear Title and Date
    const titleInput = screen.getByLabelText(/event title/i);
    fireEvent.change(titleInput, { target: { value: '' } });
    const dateInput = screen.getByLabelText(/event date/i);
    fireEvent.change(dateInput, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(/please provide an event title and a valid date/i);
  });

  it('allows navigating backward using the Back button', async () => {
    render(<OnboardingWizard isOpen={true} onClose={vi.fn()} onComplete={vi.fn()} />);

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();

    // Click Back
    const backBtn = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backBtn);

    // Should be back on Step 1
    expect(screen.getByText(/What type of celebration are you planning\?/i)).toBeInTheDocument();
  });
});
