import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { EventBriefDialog } from '../EventBriefDialog';
import { EventPlan } from '@/domain/types';

const SAMPLE_PLAN: EventPlan = {
  id: 'evt-brief-test',
  title: 'Ananya & Kabir Sangeet Gala',
  eventType: 'wedding',
  date: '2026-11-28',
  guestCount: 250,
  totalBudget: 75000,
  currency: 'INR',
  culturalContext: 'Punjabi Traditional',
  dietary: ['Vegetarian', 'Nut-Free'],
  accessibilityNeeds: ['Elevator Access'],
  budgetItems: [
    {
      id: 'b-1',
      eventId: 'evt-brief-test',
      category: 'catering',
      notes: 'Gourmet Buffet',
      estimated: 30000,
      actual: 30000,
    },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'ceremony',
      title: 'Bhangra Troupe Entry',
      time: '18:30',
      durationMinutes: 45,
      completed: true,
      assignedTo: 'Stage Lead',
    },
  ],
  vendors: [
    {
      id: 'v-1',
      category: 'entertainment',
      name: 'Rhythm Dhol Band',
      status: 'booked',
      quotedAmount: 12000,
      deliverables: ['Live Performance'],
    },
  ],
  ideas: [],
};

describe('EventBriefDialog Component & Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('renders executive brief details, metrics, and actions without axe violations', async () => {
    const { container } = render(
      <EventBriefDialog
        isOpen={true}
        onClose={vi.fn()}
        plan={SAMPLE_PLAN}
        onImportJSON={vi.fn()}
        showToast={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Event Master Brief: Ananya & Kabir Sangeet Gala/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/250 Attendees/i)).toBeInTheDocument();
    expect(screen.getByText(/Bhangra Troupe Entry/i)).toBeInTheDocument();
    expect(screen.getByText(/Rhythm Dhol Band/i)).toBeInTheDocument();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('triggers copy text and print actions when buttons are clicked', () => {
    const showToast = vi.fn();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <EventBriefDialog
        isOpen={true}
        onClose={vi.fn()}
        plan={SAMPLE_PLAN}
        onImportJSON={vi.fn()}
        showToast={showToast}
      />
    );

    const printBtn = screen.getByRole('button', { name: /print brief/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalledTimes(1);

    const exportAllBtn = screen.getByRole('button', { name: /export all csvs/i });
    fireEvent.click(exportAllBtn);
    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining('Exported complete event package')
    );
  });

  it('does not render dialog content when isOpen is false', () => {
    render(
      <EventBriefDialog
        isOpen={false}
        onClose={vi.fn()}
        plan={SAMPLE_PLAN}
        onImportJSON={vi.fn()}
        showToast={vi.fn()}
      />
    );

    expect(screen.queryByText(/Event Master Brief/i)).not.toBeInTheDocument();
  });
});
