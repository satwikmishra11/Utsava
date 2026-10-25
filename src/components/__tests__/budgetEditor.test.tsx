import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetPlanner } from '../BudgetPlanner';
import { BudgetItem } from '@/domain/types';

describe('BudgetPlanner Component Tests', () => {
  const sampleItems: BudgetItem[] = [
    {
      id: 'b-1',
      eventId: 'evt-101',
      category: 'venue',
      notes: 'Heritage Banquet Hall Deposit',
      estimated: 8000,
      actual: 8000,
      paid: true,
    },
    {
      id: 'b-2',
      eventId: 'evt-101',
      category: 'catering',
      notes: 'Buffet Catering Initial Quote',
      estimated: 4000,
      actual: 0,
      paid: false,
    },
  ];

  it('renders target budget, committed expenses, and under-budget status', () => {
    render(
      <BudgetPlanner
        totalBudget={20000}
        currency="USD"
        items={sampleItems}
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateStatus={vi.fn()}
      />
    );

    expect(screen.getByText(/total target budget/i)).toBeInTheDocument();
    expect(screen.getByText(/USD 20,000/i)).toBeInTheDocument();
    expect(screen.getByText(/committed expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/USD 12,000/i)).toBeInTheDocument();
    expect(screen.getByText(/under budget/i)).toBeInTheDocument();
  });

  it('displays overspend status when committed expenses exceed total budget', () => {
    render(
      <BudgetPlanner
        totalBudget={10000}
        currency="USD"
        items={sampleItems} // Total estimated: 12000 > 10000
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateStatus={vi.fn()}
        overspendAnalysis={{
          totalAllocated: 12000,
          totalBudget: 10000,
          isOverspent: true,
          overspentAmount: 2000,
          overspentCategories: ['venue'],
        }}
      />
    );

    expect(screen.getByText(/over budget/i)).toBeInTheDocument();
    expect(screen.getByText(/USD 2,000/i)).toBeInTheDocument();
  });

  it('submits a new custom expense via the add form', () => {
    const onAddItem = vi.fn();
    render(
      <BudgetPlanner
        totalBudget={25000}
        currency="USD"
        items={sampleItems}
        onAddItem={onAddItem}
        onRemoveItem={vi.fn()}
        onUpdateStatus={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/expense title/i);
    fireEvent.change(nameInput, { target: { value: 'DJ & Sound System' } });

    const costInput = screen.getByLabelText(/estimated cost/i);
    fireEvent.change(costInput, { target: { value: '1800' } });

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: 'entertainment' } });

    const addBtn = screen.getByRole('button', { name: /add expense/i });
    fireEvent.click(addBtn);

    expect(onAddItem).toHaveBeenCalledTimes(1);
    const addedItem = onAddItem.mock.calls[0][0];
    expect(addedItem.category).toBe('entertainment');
    expect(addedItem.notes).toBe('DJ & Sound System');
    expect(addedItem.estimated).toBe(1800);
  });

  it('calls onRemoveItem when delete button is clicked', () => {
    const onRemoveItem = vi.fn();
    render(
      <BudgetPlanner
        totalBudget={25000}
        currency="USD"
        items={sampleItems}
        onAddItem={vi.fn()}
        onRemoveItem={onRemoveItem}
        onUpdateStatus={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]!);

    expect(onRemoveItem).toHaveBeenCalledWith('b-1');
  });

  it('calls onUpdateStatus when toggle payment status is clicked', () => {
    const onUpdateStatus = vi.fn();
    render(
      <BudgetPlanner
        totalBudget={25000}
        currency="USD"
        items={sampleItems}
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateStatus={onUpdateStatus}
      />
    );

    const toggleButtons = screen.getAllByRole('button', { name: /toggle payment status/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]!);

    expect(onUpdateStatus).toHaveBeenCalledWith('b-1');
  });

  it('renders pending AI suggestions with Accept and Dismiss actions', () => {
    const onAcceptSuggestions = vi.fn();
    const onDismissSuggestions = vi.fn();

    render(
      <BudgetPlanner
        totalBudget={25000}
        currency="USD"
        items={sampleItems}
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateStatus={vi.fn()}
        pendingSuggestions={[
          { category: 'photography', estimated: 3200, notes: 'Full day coverage with drone' },
        ]}
        onAcceptSuggestions={onAcceptSuggestions}
        onDismissSuggestions={onDismissSuggestions}
      />
    );

    expect(screen.getByText(/AI Budget Allocation Suggestions/i)).toBeInTheDocument();
    expect(screen.getByText(/Full day coverage with drone/i)).toBeInTheDocument();

    const acceptBtn = screen.getByRole('button', { name: /accept suggestions/i });
    fireEvent.click(acceptBtn);
    expect(onAcceptSuggestions).toHaveBeenCalledTimes(1);

    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtn);
    expect(onDismissSuggestions).toHaveBeenCalledTimes(1);
  });

  it('toggles between visual chart and accessible data table view', () => {
    render(
      <BudgetPlanner
        totalBudget={25000}
        currency="USD"
        items={sampleItems}
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateStatus={vi.fn()}
      />
    );

    expect(
      screen.getByRole('img', { name: /category budget breakdown chart/i })
    ).toBeInTheDocument();

    const toggleViewBtn = screen.getByRole('button', { name: /view as data table/i });
    fireEvent.click(toggleViewBtn);

    expect(
      screen.getByRole('table', { name: /category spending breakdown table/i })
    ).toBeInTheDocument();

    // Toggle back to chart
    const toggleBackBtn = screen.getByRole('button', { name: /view as chart/i });
    fireEvent.click(toggleBackBtn);
    expect(
      screen.getByRole('img', { name: /category budget breakdown chart/i })
    ).toBeInTheDocument();
  });

  it('displays empty state when there are no budget items', () => {
    render(
      <BudgetPlanner
        totalBudget={25000}
        currency="USD"
        items={[]}
        onAddItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateStatus={vi.fn()}
      />
    );

    expect(screen.getByText(/no budget items yet/i)).toBeInTheDocument();
  });
});
