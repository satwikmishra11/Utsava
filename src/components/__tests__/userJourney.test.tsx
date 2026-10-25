import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { OnboardingWizard, WizardData } from '../OnboardingWizard';
import { BudgetPlanner } from '../BudgetPlanner';
import { TimelineGenerator } from '../TimelineGenerator';
import { VendorChecklist } from '../VendorChecklist';
import { IdeaGenerator } from '../IdeaGenerator';
import { ThemeToggle } from '../ThemeToggle';
import {
  exportPlanToICS,
  generateShareableLink,
  exportPlanToPrintablePDF,
} from '@/lib/exportUtils';
import { detectOverspend } from '@/domain/budgetLogic';
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
    {
      id: 't-2',
      phase: 'reception',
      title: 'Dinner Reception',
      time: '19:00',
      durationMinutes: 120,
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

describe('Full User Journey — End-to-End Acceptance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('completes onboarding wizard end-to-end with keyboard input', () => {
    let completedData: WizardData | null = null;
    render(
      <OnboardingWizard
        isOpen={true}
        onClose={() => {}}
        onComplete={(d) => {
          completedData = d;
        }}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /wedding/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    fireEvent.change(screen.getByLabelText(/event title/i), {
      target: { value: 'Priya & Arjun Royal Wedding' },
    });
    fireEvent.change(screen.getByLabelText(/event date/i), { target: { value: '2026-12-15' } });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    fireEvent.change(screen.getByLabelText(/guest count/i), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    fireEvent.change(screen.getByLabelText(/total target budget/i), { target: { value: '50000' } });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    fireEvent.click(screen.getByRole('button', { name: /create event plan/i }));

    expect(completedData).not.toBeNull();
    const data = completedData as WizardData | null;
    expect(data?.eventType).toBe('wedding');
    expect(data?.title).toBe('Priya & Arjun Royal Wedding');
    expect(data?.guestCount).toBe(200);
    expect(data?.totalBudget).toBe(50000);
  });

  it('enforces validation on required wizard steps and rejects invalid inputs', () => {
    render(<OnboardingWizard isOpen={true} onClose={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    fireEvent.change(screen.getByLabelText(/event title/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/provide an event title and a valid date/i);

    fireEvent.change(screen.getByLabelText(/event title/i), { target: { value: 'Valid Title' } });
    fireEvent.change(screen.getByLabelText(/event date/i), { target: { value: '2026-11-20' } });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    fireEvent.change(screen.getByLabelText(/guest count/i), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/positive guest count/i);
  });

  it('navigates backwards through wizard steps using back button', () => {
    render(<OnboardingWizard isOpen={true} onClose={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(screen.getByText(/what type of celebration/i)).toBeInTheDocument();
  });

  it('supports AI budget regeneration, accept suggestions, and overspend warnings', () => {
    let accepted = false;
    let dismissed = false;
    let regenerated = false;

    render(
      <BudgetPlanner
        totalBudget={15000}
        currency="INR"
        items={MOCK_PLAN.budgetItems}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onUpdateStatus={() => {}}
        onRegenerateAI={() => {
          regenerated = true;
        }}
        pendingSuggestions={[{ category: 'catering', estimated: 8000, notes: 'Multi-course menu' }]}
        onAcceptSuggestions={() => {
          accepted = true;
        }}
        onDismissSuggestions={() => {
          dismissed = true;
        }}
        overspendAnalysis={detectOverspend(15000, MOCK_PLAN.budgetItems)}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/overspend alert/i);
    expect(screen.getByText(/✨ AI Budget Suggestions Ready/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /accept suggestions/i }));
    expect(accepted).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(dismissed).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /regenerate ai budget/i }));
    expect(regenerated).toBe(true);
  });

  it('supports AI timeline regeneration, upcoming tasks view, and accept schedule', () => {
    let accepted = false;
    let toggledId = '';

    render(
      <TimelineGenerator
        items={MOCK_PLAN.timelineItems}
        eventType="wedding"
        onAddItem={() => {}}
        onToggleComplete={(id) => {
          toggledId = id;
        }}
        onBulkReplaceTimeline={() => {}}
        onRegenerateAI={() => {}}
        pendingSuggestions={[
          {
            id: 't-ai-1',
            title: 'Send Invitations',
            dueDate: '2026-09-01',
            category: 'preparation',
            daysBeforeEvent: 90,
            dependsOn: [],
            status: 'pending',
          },
        ]}
        onAcceptSuggestions={() => {
          accepted = true;
        }}
        onDismissSuggestions={() => {}}
      />
    );

    expect(screen.getByText(/upcoming milestone priorities/i)).toBeInTheDocument();
    expect(screen.getByText(/✨ AI Timeline Schedule Ready/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /accept schedule/i }));
    expect(accepted).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /complete baraat arrival/i }));
    expect(toggledId).toBe('t-1');
  });

  it('supports vendor board status transitions and AI vendor suggestions', () => {
    let accepted = false;
    let updatedStatus = '';

    render(
      <VendorChecklist
        vendors={MOCK_PLAN.vendors}
        currency="INR"
        onAddVendor={() => {}}
        onUpdateStatus={(_id, status) => {
          updatedStatus = status;
        }}
        onRegenerateAI={() => {}}
        pendingSuggestions={[
          {
            category: 'photography',
            name: 'Artisan Photo Studio',
            role: 'Cinematography',
            estimatedQuote: 4000,
            status: 'shortlisted',
            deliverables: ['4K Video'],
            recommendedLeadWeeks: 8,
            priority: 'high',
          },
        ]}
        onAcceptSuggestions={() => {
          accepted = true;
        }}
        onDismissSuggestions={() => {}}
      />
    );

    expect(screen.getByText(/✨ AI Recommended Vendors Ready/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /accept vendors/i }));
    expect(accepted).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /move to booked/i }));
    expect(updatedStatus).toBe('booked');
  });

  it('supports idea category filtering, saving suggestions, and AI regeneration', () => {
    let savedIdeaId = '';
    render(
      <IdeaGenerator
        eventType="wedding"
        guestCount={200}
        ideas={MOCK_PLAN.ideas}
        onSaveIdea={(idea) => {
          savedIdeaId = idea.id;
        }}
        onBulkAddIdeas={() => {}}
        onRegenerateAI={() => {}}
        pendingSuggestions={MOCK_PLAN.ideas}
        onAcceptSuggestions={() => {}}
        onDismissSuggestions={() => {}}
      />
    );

    expect(screen.getByText(/✨ AI Creative Concepts Ready/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /decor/i }));
    expect(screen.getByText('Marigold Mandap Arch')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /accept suggestion/i }));
    expect(savedIdeaId).toBe('i-1');
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

  it('meets WCAG 2.2 AA accessibility standards with zero axe violations on the wizard', async () => {
    const { container } = render(
      <OnboardingWizard isOpen={true} onClose={() => {}} onComplete={() => {}} />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
