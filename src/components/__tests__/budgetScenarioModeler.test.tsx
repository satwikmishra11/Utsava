import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import axe from 'axe-core';
import { BudgetScenarioModeler } from '../budget/BudgetScenarioModeler';
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

describe('BudgetScenarioModeler UI Component', () => {
  it('renders collapsed toggle button by default with correct aria-expanded', () => {
    render(
      <BudgetScenarioModeler
        totalBudget={40000}
        guestCount={100}
        currency="INR"
        items={MOCK_ITEMS}
      />
    );

    const toggleBtn = screen.getByRole('button', {
      name: /what-if scenario & guest sensitivity modeler/i,
    });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('expands on click and displays KPI cards, simulator slider, and scenario table with zero axe violations', async () => {
    const { container } = render(
      <BudgetScenarioModeler
        totalBudget={40000}
        guestCount={100}
        currency="INR"
        items={MOCK_ITEMS}
      />
    );

    const toggleBtn = screen.getByRole('button', {
      name: /what-if scenario & guest sensitivity modeler/i,
    });
    fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Fixed Overhead/i)).toBeInTheDocument();
    expect(screen.getByText(/Variable \(Per-Head\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Sustainable Guests/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Intimate (-25%)')).toBeInTheDocument();
    expect(screen.getByText('Baseline (Current)')).toBeInTheDocument();
    expect(screen.getByText('Expanded (+25%)')).toBeInTheDocument();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('allows adjusting the custom guest count simulator slider', () => {
    render(
      <BudgetScenarioModeler
        totalBudget={40000}
        guestCount={100}
        currency="INR"
        items={MOCK_ITEMS}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /what-if scenario & guest sensitivity modeler/i })
    );

    const slider = screen.getByLabelText(/adjust custom guest count simulation/i);
    expect(slider).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '150' } });
    expect(screen.getByText(/150 Guests/i)).toBeInTheDocument();
  });
});
