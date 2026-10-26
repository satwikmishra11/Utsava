import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import {
  exportPlanToICS,
  generateShareableLink,
  exportPlanToPrintablePDF,
} from '@/lib/exportUtils';
import { EventPlan } from '@/domain/types';

const MOCK_PLAN: EventPlan = {
  id: 'evt-test-1',
  title: 'Priya & Arjun Royal Wedding',
  eventType: 'wedding',
  date: '2026-12-15',
  guestCount: 200,
  totalBudget: 50000,
  currency: 'INR',
  culturalContext: 'South Asian Traditional',
  budgetItems: [
    {
      id: 'b-1',
      eventId: 'evt-test-1',
      category: 'venue',
      notes: 'Heritage Palace',
      estimated: 20000,
      actual: 20000,
    },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'ceremony',
      title: 'Baraat Arrival',
      time: '15:00',
      durationMinutes: 60,
      completed: false,
    },
  ],
  vendors: [
    {
      id: 'v-1',
      category: 'venue',
      name: 'Palace Estate',
      status: 'shortlisted',
      quotedAmount: 20000,
      deliverables: ['Grand Ballroom'],
    },
  ],
  ideas: [
    {
      id: 'i-1',
      category: 'decor',
      title: 'Marigold Mandap Arch',
      description: 'Fresh floral canopy',
      estimatedCostTier: 'medium',
      culturalContext: 'Vedic',
      tags: ['floral', 'mandap'],
    },
  ],
};

describe('User Journey — Exports and Theme Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('exports plan as RFC 5545 iCalendar (.ics) and shareable encoded link', () => {
    const link = generateShareableLink(MOCK_PLAN);
    expect(link).toContain('?shared=');

    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    exportPlanToPrintablePDF();
    expect(printSpy).toHaveBeenCalled();

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    exportPlanToICS(MOCK_PLAN);
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('toggles light and dark themes updating document attribute and storage', () => {
    render(<ThemeToggle />);
    const toggleBtn = screen.getByRole('button', { name: /switch to/i });

    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('utsava-theme')).toBe('light');

    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('utsava-theme')).toBe('dark');
  });
});
