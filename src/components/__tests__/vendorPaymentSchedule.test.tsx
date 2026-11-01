import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { VendorPaymentSchedule } from '../vendors/VendorPaymentSchedule';
import { VendorItem } from '@/domain/types';

const MOCK_VENDORS: readonly VendorItem[] = [
  {
    id: 'v-1',
    category: 'catering',
    name: 'Imperial Feast Caterers',
    status: 'booked',
    quotedAmount: 15000,
    deliverables: ['Dinner', 'Cocktails'],
  },
  {
    id: 'v-2',
    category: 'photography',
    name: 'Pixel Perfect',
    status: 'paid',
    quotedAmount: 8000,
    deliverables: ['Raw Photos'],
  },
];

describe('VendorPaymentSchedule UI Component', () => {
  it('renders collapsed schedule button by default', () => {
    render(<VendorPaymentSchedule vendors={MOCK_VENDORS} currency="INR" />);

    const toggleBtn = screen.getByRole('button', {
      name: /vendor payment schedule & cash flow milestones/i,
    });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('expands schedule and displays cash flow KPI metrics and milestone table', () => {
    render(<VendorPaymentSchedule vendors={MOCK_VENDORS} currency="INR" />);

    const toggleBtn = screen.getByRole('button', {
      name: /vendor payment schedule & cash flow milestones/i,
    });
    fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Total Committed Contracts/i)).toBeInTheDocument();
    expect(screen.getByText(/Retainers Settled/i)).toBeInTheDocument();
    expect(screen.getByText(/Imminent Liabilities/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    expect(screen.getAllByText('Imperial Feast Caterers')).toHaveLength(3);
    expect(screen.getAllByText('Pixel Perfect')).toHaveLength(3);
    expect(screen.getAllByText(/Settled/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Due in 14d/i).length).toBeGreaterThan(0);
  });
});
