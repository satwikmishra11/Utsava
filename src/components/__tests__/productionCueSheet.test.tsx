import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import axe from 'axe-core';
import { ProductionCueSheet } from '../timeline/ProductionCueSheet';
import { TimelineItem } from '@/domain/types';

const MOCK_ITEMS: readonly TimelineItem[] = [
  {
    id: 't-1',
    phase: 'preparation',
    title: 'Sound Check & Microphones',
    time: '14:00',
    durationMinutes: 45,
    completed: true,
  },
  {
    id: 't-2',
    phase: 'ceremony',
    title: 'Grand Entrance & Welcome',
    time: '14:50',
    durationMinutes: 30,
    completed: false,
    assignedTo: 'Emcee John',
  },
  {
    id: 't-3',
    phase: 'reception',
    title: 'Dinner Buffet Service',
    time: '15:25',
    durationMinutes: 60,
    completed: false,
  },
];

describe('ProductionCueSheet UI Component & Accessibility', () => {
  it('renders collapsed toggle button by default with correct aria-expanded', () => {
    render(<ProductionCueSheet items={MOCK_ITEMS} eventType="wedding" />);

    const toggleBtn = screen.getByRole('button', {
      name: /production cue sheet & av \/ tech rider/i,
    });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('expands cue sheet, renders table, and passes axe-core accessibility audit', async () => {
    const { container } = render(<ProductionCueSheet items={MOCK_ITEMS} eventType="wedding" />);

    const toggleBtn = screen.getByRole('button', {
      name: /production cue sheet & av \/ tech rider/i,
    });
    fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('table', { name: /production cue sheet and av tech rider/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Sound Check & Microphones')).toBeInTheDocument();
    expect(screen.getByText('Grand Entrance & Welcome')).toBeInTheDocument();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('filters cues by crew role when filter pills are selected', () => {
    render(<ProductionCueSheet items={MOCK_ITEMS} eventType="wedding" />);

    fireEvent.click(
      screen.getByRole('button', { name: /production cue sheet & av \/ tech rider/i })
    );

    const hospitalityBtn = screen.getByRole('button', { name: /^hospitality$/i });
    fireEvent.click(hospitalityBtn);

    expect(screen.getByText('Dinner Buffet Service')).toBeInTheDocument();
    expect(screen.queryByText('Sound Check & Microphones')).not.toBeInTheDocument();
  });
});
