import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { NavigationTabs, TabId } from '../NavigationTabs';
import { BudgetPlanner } from '../BudgetPlanner';
import { TimelineGenerator } from '../TimelineGenerator';
import { VendorChecklist } from '../VendorChecklist';

describe('UI Accessibility & Interaction (WCAG 2.2 AA)', () => {
  it('NavigationTabs has no axe violations and supports keyboard navigation', async () => {
    let active: TabId = 'budget';
    const { container, rerender } = render(
      <NavigationTabs activeTab={active} onTabChange={(t) => (active = t)} />
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);

    const budgetTab = screen.getByRole('tab', { name: /budget/i });
    expect(budgetTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(budgetTab, { key: 'ArrowRight' });
    expect(active).toBe('timeline');

    rerender(<NavigationTabs activeTab="timeline" onTabChange={(t) => (active = t)} />);
    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');
  });

  it('BudgetPlanner has no axe violations', async () => {
    const { container } = render(
      <BudgetPlanner
        totalBudget={20000}
        currency="INR"
        items={[
          {
            id: 'b-1',
            eventId: 'evt-1',
            category: 'venue',
            estimated: 8000,
            actual: 8000,
            notes: 'Ballroom',
          },
        ]}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onUpdateStatus={() => {}}
      />
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('TimelineGenerator has no axe violations and renders accessible alerts', async () => {
    const { container } = render(
      <TimelineGenerator
        items={[
          {
            id: 't-1',
            phase: 'ceremony',
            title: 'Ritual Ceremony',
            time: '14:00',
            durationMinutes: 60,
            completed: false,
          },
        ]}
        eventType="wedding"
        onAddItem={() => {}}
        onToggleComplete={() => {}}
        onBulkReplaceTimeline={() => {}}
      />
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('VendorChecklist renders with accessible form elements and no axe violations', async () => {
    const { container } = render(
      <VendorChecklist
        vendors={[
          {
            id: 'v-1',
            category: 'catering',
            name: 'Delicious Catering',
            status: 'booked',
            quotedAmount: 5000,
            deliverables: ['Dinner', 'Drinks'],
          },
        ]}
        currency="INR"
        onAddVendor={() => {}}
        onUpdateStatus={() => {}}
      />
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
