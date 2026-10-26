import { describe, it, expect } from 'vitest';
import {
  buildBudgetPrompt,
  buildBudgetRetryPrompt,
  buildTimelinePrompt,
  buildTimelineRetryPrompt,
  buildVendorPrompt,
  buildVendorRetryPrompt,
  buildIdeasPrompt,
  buildIdeasRetryPrompt,
  buildChatPrompt,
  buildChatRetryPrompt,
} from '../index';
import { PersonalizationContext } from '../../types';

describe('Prompt Builders Deep Unit Tests', () => {
  const weddingContext: PersonalizationContext = {
    eventType: 'wedding',
    culture: 'Hindu Traditional',
    budgetBand: 'luxury',
    totalBudget: 80000,
    currency: 'INR',
    guestCount: 350,
    dietary: ['Jain Vegetarian', 'Gluten-Free', 'Halal'],
    accessibilityNeeds: ['Wheelchair access', 'Quiet room for sensory sensitivity'],
    location: 'Napa Valley, CA',
    eventDate: '2026-10-18',
  };

  const birthdayContext: PersonalizationContext = {
    eventType: 'birthday',
    culture: 'Mexican Fiesta',
    budgetBand: 'budget',
    totalBudget: 2500,
    currency: 'INR',
    guestCount: 40,
    dietary: ['Vegetarian'],
    accessibilityNeeds: [],
    location: 'Austin, TX',
    eventDate: '2026-08-12',
  };

  const communityContext: PersonalizationContext = {
    eventType: 'community',
    budgetBand: 'moderate',
    totalBudget: 15000,
    currency: 'INR',
    guestCount: 500,
    dietary: ['Vegan', 'Nut-Free'],
    accessibilityNeeds: ['ASL interpreters', 'Braille signage'],
    location: 'Seattle Community Center',
    eventDate: '2026-09-05',
  };

  describe('Budget Prompt Builder', () => {
    it('embeds wedding culture, luxury band, and dietary requirements', () => {
      const prompt = buildBudgetPrompt(weddingContext);
      expect(prompt).toContain('Hindu Traditional');
      expect(prompt).toContain('luxury');
      expect(prompt).toContain('80000');
      expect(prompt).toContain('Jain Vegetarian');
      expect(prompt).toContain('"hasDietaryRequirements": true');
      expect(prompt).toContain('"hasAccessibilityNeeds": true');
      expect(prompt).toContain('"perGuestCost": 229');
    });

    it('handles minimal context with default fallback values', () => {
      const minimalContext: PersonalizationContext = {
        eventType: 'birthday',
        guestCount: 25,
      };
      const prompt = buildBudgetPrompt(minimalContext);
      expect(prompt).toContain('birthday');
      expect(prompt).toContain('25');
      expect(prompt).toContain('"culture": "general"');
      expect(prompt).toContain('"totalBudget": 10000');
    });

    it('generates error-specific retry prompts', () => {
      const retry = buildBudgetRetryPrompt(
        'ORIGINAL_PROMPT',
        'Total allocated exceeds budget limit'
      );
      expect(retry).toContain('ORIGINAL_PROMPT');
      expect(retry).toContain('Total allocated exceeds budget limit');
      expect(retry).toContain('[RETRY_INSTRUCTION]');
    });
  });

  describe('Timeline Prompt Builder', () => {
    it('embeds event date and dependency guidelines for community events', () => {
      const prompt = buildTimelinePrompt(communityContext);
      expect(prompt).toContain('2026-09-05');
      expect(prompt).toContain('daysBeforeEvent');
      expect(prompt).toContain('acyclic dependency graph');
    });

    it('generates retry prompt with cycle detection feedback', () => {
      const retry = buildTimelineRetryPrompt(
        'ORIG_TIMELINE',
        'Cycle detected between task-1 and task-2'
      );
      expect(retry).toContain('Cycle detected');
      expect(retry).toContain('ORIG_TIMELINE');
    });
  });

  describe('Vendor Prompt Builder', () => {
    it('specifies cultural lead times and critical priorities', () => {
      const prompt = buildVendorPrompt(weddingContext);
      expect(prompt).toContain('Hindu Traditional');
      expect(prompt).toContain('recommendedLeadWeeks');
      expect(prompt).toContain('priority');
    });

    it('generates retry prompt on schema mismatch', () => {
      const retry = buildVendorRetryPrompt(
        'ORIG_VENDOR',
        'Field "estimatedQuote" must be non-negative'
      );
      expect(retry).toContain('Field "estimatedQuote" must be non-negative');
    });
  });

  describe('Ideas Prompt Builder', () => {
    it('incorporates dietary and accessibility needs into creative brief', () => {
      const prompt = buildIdeasPrompt(weddingContext);
      expect(prompt).toContain('Wheelchair access');
      expect(prompt).toContain('Quiet room');
      expect(prompt).toContain('Jain Vegetarian');
    });

    it('builds creative brief for casual birthday party', () => {
      const prompt = buildIdeasPrompt(birthdayContext);
      expect(prompt).toContain('Mexican Fiesta');
      expect(prompt).toContain('budget');
      expect(prompt).toContain('Austin, TX');
    });

    it('generates retry prompt with category corrections', () => {
      const retry = buildIdeasRetryPrompt('ORIG_IDEAS', 'Missing category "food_beverage"');
      expect(retry).toContain('Missing category "food_beverage"');
    });
  });

  describe('Chat Prompt Builder', () => {
    it('escapes dangerous HTML/script injection attempts in user messages', () => {
      const prompt = buildChatPrompt({
        message: 'Hello <img src=x onerror=alert("hacked")> <script>evil()</script>',
        planSummary: { title: 'Community Fair', budget: 15000 },
        history: [],
      });
      expect(prompt).not.toContain('<script>');
      expect(prompt).toContain('&lt;script&gt;');
      expect(prompt).not.toContain('<img');
      expect(prompt).toContain('&lt;img');
    });

    it('embeds plan summary and history context accurately', () => {
      const prompt = buildChatPrompt({
        message: 'Add a photographer task for next week',
        planSummary: { title: 'Fiesta Birthday', budget: 2500, guestCount: 40 },
        history: [
          { role: 'user', content: 'What is our budget?' },
          { role: 'assistant', content: 'Your budget is $2,500.' },
        ],
      });
      expect(prompt).toContain('Fiesta Birthday');
      expect(prompt).toContain('2500');
      expect(prompt).toContain('What is our budget?');
      expect(prompt).toContain('Your budget is $2,500.');
    });

    it('generates retry prompt on invalid tool parameters', () => {
      const retry = buildChatRetryPrompt(
        'ORIG_CHAT',
        'Tool call parameters failed schema validation'
      );
      expect(retry).toContain('Tool call parameters failed schema validation');
    });
  });
});
