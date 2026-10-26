import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhyThisPlanDisclosure } from '../WhyThisPlanDisclosure';

describe('WhyThisPlanDisclosure Component', () => {
  it('renders semantic details and summary with accessible label and id', () => {
    render(
      <WhyThisPlanDisclosure
        id="why-this-plan-test"
        budgetReasons={['Large guest list (300): +2% logistics, +2% catering from decor.']}
        timelineReasons={['Event is 21 days away: lead times compressed to 35%']}
      />
    );

    const details = document.getElementById('why-this-plan-test');
    expect(details).toBeInTheDocument();
    expect(details?.tagName.toLowerCase()).toBe('details');

    const summary = screen.getByText('Why this plan?');
    expect(summary).toBeInTheDocument();
    expect(screen.getByText('2 factors')).toBeInTheDocument();
  });

  it('lists reasons in a labelled list with textual indicators preventing color-only meaning', () => {
    render(
      <WhyThisPlanDisclosure
        id="why-this-plan-test"
        budgetReasons={['Large guest list (300): +2% logistics']}
        timelineReasons={['Event is 21 days away: lead times compressed to 35%']}
      />
    );

    const list = screen.getByRole('list', { name: /why this plan reasons/i });
    expect(list).toBeInTheDocument();
    expect(list.id).toBe('why-this-plan-test-reasons-list');

    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();

    const budgetItem = document.getElementById('why-this-plan-test-budget-reason-0');
    expect(budgetItem).toBeInTheDocument();
    expect(budgetItem?.textContent).toContain('Large guest list (300): +2% logistics');

    const timelineItem = document.getElementById('why-this-plan-test-timeline-reason-0');
    expect(timelineItem).toBeInTheDocument();
    expect(timelineItem?.textContent).toContain(
      'Event is 21 days away: lead times compressed to 35%'
    );
  });

  it('renders fallback standard message when no reasons are provided', () => {
    render(<WhyThisPlanDisclosure id="why-this-plan-empty-test" />);

    const emptyText = screen.getByText(/standard recommended allocation and schedule/i);
    expect(emptyText).toBeInTheDocument();
    expect(emptyText.id).toBe('why-this-plan-empty-test-empty');
  });

  it('supports keyboard interaction to open and close disclosure', () => {
    render(
      <WhyThisPlanDisclosure
        id="why-this-plan-keyboard-test"
        budgetReasons={['Dietary adjustments: +2% catering']}
      />
    );

    const summary = screen.getByText('Why this plan?');
    const details = document.getElementById('why-this-plan-keyboard-test') as HTMLDetailsElement;
    expect(details.open).toBe(false);

    fireEvent.click(summary);
    expect(details.open).toBe(true);

    fireEvent.click(summary);
    expect(details.open).toBe(false);
  });
});
