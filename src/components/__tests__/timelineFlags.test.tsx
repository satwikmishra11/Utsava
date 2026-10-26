import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { TimelineItemRow } from '../timeline/TimelineItemRow';
import { UpcomingTasksPanel } from '../timeline/UpcomingTasksPanel';
import { TimelineItem } from '@/domain/types';

describe('Timeline Flags UI Rendering', () => {
  const baseItem: TimelineItem = {
    id: 't-test-1',
    phase: 'preparation',
    title: 'Book Venue',
    time: '2026-11-01',
    durationMinutes: 60,
    completed: false,
  };

  it('renders standard timeline row without flags', () => {
    render(<TimelineItemRow item={baseItem} onToggle={vi.fn()} />);
    expect(screen.getByText('Book Venue')).toBeInTheDocument();
    expect(screen.queryByText('Compressed')).not.toBeInTheDocument();
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('surfaces compressed flag with text, icon, and unique id', () => {
    const compressedItem: TimelineItem = {
      ...baseItem,
      id: 't-comp',
      flags: ['compressed'],
      isCompressed: true,
    };

    const { container } = render(<TimelineItemRow item={compressedItem} onToggle={vi.fn()} />);

    const badge = container.querySelector('#timeline-flag-compressed-t-comp');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Compressed');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('surfaces overdue flag with text, icon, and unique id', () => {
    const overdueItem: TimelineItem = {
      ...baseItem,
      id: 't-over',
      flags: ['overdue'],
      isOverdue: true,
    };

    const { container } = render(<TimelineItemRow item={overdueItem} onToggle={vi.fn()} />);

    const badge = container.querySelector('#timeline-flag-overdue-t-over');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Overdue');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('surfaces both compressed and overdue flags simultaneously', () => {
    const dualItem: TimelineItem = {
      ...baseItem,
      id: 't-dual',
      flags: ['compressed', 'overdue'],
      isCompressed: true,
      isOverdue: true,
    };

    const { container } = render(<TimelineItemRow item={dualItem} onToggle={vi.fn()} />);

    expect(container.querySelector('#timeline-flag-compressed-t-dual')).toBeInTheDocument();
    expect(container.querySelector('#timeline-flag-overdue-t-dual')).toBeInTheDocument();
  });

  it('surfaces flags in UpcomingTasksPanel with dedicated upcoming ids', () => {
    const items: readonly TimelineItem[] = [
      {
        ...baseItem,
        id: 't-up-comp',
        title: 'Urgent Catering',
        flags: ['compressed'],
        isCompressed: true,
      },
    ];

    const { container } = render(<UpcomingTasksPanel items={items} onToggle={vi.fn()} />);

    const badge = container.querySelector('#upcoming-flag-compressed-t-up-comp');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Compressed');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('passes axe accessibility audit with zero violations on flagged items', async () => {
    const dualItem: TimelineItem = {
      ...baseItem,
      id: 't-axe',
      flags: ['compressed', 'overdue'],
      isCompressed: true,
      isOverdue: true,
    };

    const { container } = render(
      <ul>
        <TimelineItemRow item={dualItem} onToggle={vi.fn()} />
      </ul>
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
