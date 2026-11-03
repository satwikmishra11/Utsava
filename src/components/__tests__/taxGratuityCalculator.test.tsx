import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import axe from 'axe-core';
import { TaxGratuityCalculator } from '../budget/TaxGratuityCalculator';
import { BudgetItem } from '@/domain/schemas';

const MOCK_ITEMS: readonly BudgetItem[] = [
  {
    id: 'b-1',
    eventId: 'evt-1',
    category: 'venue',
    estimated: 12000,
    actual: 12000,
  },
  {
    id: 'b-2',
    eventId: 'evt-1',
    category: 'catering',
    estimated: 18000,
    actual: 18000,
  },
];

describe('TaxGratuityCalculator UI Component & Accessibility', () => {
  it('renders collapsed toggle button by default with correct aria-expanded', () => {
    render(<TaxGratuityCalculator totalBudget={40000} currency="INR" items={MOCK_ITEMS} />);

    const toggleBtn = screen.getByRole('button', {
      name: /regional tax, gratuity & true cost forecaster/i,
    });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('expands calculator, renders breakdown table, and passes axe-core accessibility audit', async () => {
    const { container } = render(
      <TaxGratuityCalculator totalBudget={40000} currency="INR" items={MOCK_ITEMS} />
    );

    const toggleBtn = screen.getByRole('button', {
      name: /regional tax, gratuity & true cost forecaster/i,
    });
    fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('table', { name: /tax and service fee breakdown/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Net Contract Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Projected Gross Liability')).toBeInTheDocument();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('updates tax and gratuity rates when regional preset buttons are clicked', () => {
    render(<TaxGratuityCalculator totalBudget={40000} currency="INR" items={MOCK_ITEMS} />);

    fireEvent.click(
      screen.getByRole('button', { name: /regional tax, gratuity & true cost forecaster/i })
    );

    const indiaPresetBtn = screen.getByRole('button', { name: /india gst/i });
    fireEvent.click(indiaPresetBtn);

    expect(screen.getAllByText('18%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10%').length).toBeGreaterThan(0);
  });
});
