import { describe, it, expect } from 'vitest';
import { detectActionProposal } from '../actionProposals';
import { EventPlan } from '@/domain/types';
import { CONTINGENCY_RATIO_RECOMMENDED, FALLBACK_EXPENSE_ESTIMATE_VENDOR } from '@/lib/constants';

describe('detectActionProposal', () => {
  const mockPlan: EventPlan = {
    id: 'plan-test-1',
    title: 'Festival of Lights',
    eventType: 'festival',
    date: '2026-11-01',
    guestCount: 200,
    totalBudget: 50000,
    currency: 'INR',
    budgetItems: [],
    timelineItems: [],
    vendors: [],
    ideas: [],
  };

  it('detects budget-related proposals using keywords', () => {
    const texts = [
      'We should allocate more budget for flowers.',
      'What is the estimated cost of security?',
      'Let us keep a contingency reserve for emergencies.',
    ];

    for (const text of texts) {
      const proposal = detectActionProposal(text, mockPlan);
      expect(proposal).toBeDefined();
      expect(proposal?.actionType).toBe('add_budget_item');
      if (proposal?.actionType === 'add_budget_item') {
        expect(proposal.payload.estimatedCost).toBe(
          Math.round(mockPlan.totalBudget * CONTINGENCY_RATIO_RECOMMENDED)
        );
        expect(proposal.payload.category).toBe('miscellaneous');
      }
    }
  });

  it('detects timeline-related proposals using keywords', () => {
    const texts = [
      'Can you adjust our timeline?',
      'Let us review the event schedule.',
      'We have a missing logistics task.',
    ];

    for (const text of texts) {
      const proposal = detectActionProposal(text, mockPlan);
      expect(proposal).toBeDefined();
      expect(proposal?.actionType).toBe('add_timeline_item');
      if (proposal?.actionType === 'add_timeline_item') {
        expect(proposal.payload.title).toBe('Review event milestones & logistics');
        expect(proposal.payload.assignedTo).toBe('Event Organizer');
      }
    }
  });

  it('detects vendor-related proposals using keywords', () => {
    const texts = [
      'Find a reputable vendor for the reception.',
      'We need to cater dinner for 200 guests.',
      'Book a photo booth for the evening.',
    ];

    for (const text of texts) {
      const proposal = detectActionProposal(text, mockPlan);
      expect(proposal).toBeDefined();
      expect(proposal?.actionType).toBe('add_vendor_item');
      if (proposal?.actionType === 'add_vendor_item') {
        expect(proposal.payload.category).toBe('catering');
        expect(proposal.payload.estimatedCost).toBe(FALLBACK_EXPENSE_ESTIMATE_VENDOR);
      }
    }
  });

  it('returns undefined for conversational text without actionable keywords', () => {
    expect(detectActionProposal('Hello! How are you doing today?', mockPlan)).toBeUndefined();
    expect(detectActionProposal('Thank you for the guidance.', mockPlan)).toBeUndefined();
  });
});
