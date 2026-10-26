import { describe, it, expect } from 'vitest';
import {
  BUDGET_PROMPT_VERSION,
  buildBudgetPrompt,
  buildBudgetRetryPrompt,
  TIMELINE_PROMPT_VERSION,
  buildTimelinePrompt,
  buildTimelineRetryPrompt,
  VENDOR_PROMPT_VERSION,
  buildVendorPrompt,
  buildVendorRetryPrompt,
  IDEAS_PROMPT_VERSION,
  buildIdeasPrompt,
  buildIdeasRetryPrompt,
  CHAT_PROMPT_VERSION,
  buildChatPrompt,
  buildChatRetryPrompt,
} from '../prompts';
import { PersonalizationContext } from '../types';

describe('Versioned & Parameterized Prompt Templates', () => {
  const sampleContext: PersonalizationContext = {
    eventType: 'wedding',
    culture: 'South Asian',
    budgetBand: 'moderate',
    totalBudget: 35000,
    currency: 'INR',
    guestCount: 200,
    dietary: ['Vegetarian', 'Nut-Free'],
    accessibilityNeeds: ['Wheelchair Ramp', 'Sign Language'],
    location: 'San Francisco, CA',
    eventDate: '2026-11-20',
  };

  it('declares semantic versions for all prompts', () => {
    expect(BUDGET_PROMPT_VERSION).toBe('1.1.0');
    expect(TIMELINE_PROMPT_VERSION).toBe('1.0.0');
    expect(VENDOR_PROMPT_VERSION).toBe('1.0.0');
    expect(IDEAS_PROMPT_VERSION).toBe('1.0.0');
    expect(CHAT_PROMPT_VERSION).toBe('1.0.0');
  });

  it('builds budget prompt with parameterized envelope and schema constraints', () => {
    const prompt = buildBudgetPrompt(sampleContext);
    expect(prompt).toContain(BUDGET_PROMPT_VERSION);
    expect(prompt).toContain('35000');
    expect(prompt).toContain('South Asian');
    expect(prompt).toContain('[EVENT_CONTEXT]');
    expect(prompt).toContain('[SYSTEM_INSTRUCTION]');
  });

  it('builds timeline prompt with task dependency requirements', () => {
    const prompt = buildTimelinePrompt(sampleContext);
    expect(prompt).toContain(TIMELINE_PROMPT_VERSION);
    expect(prompt).toContain('2026-11-20');
    expect(prompt).toContain('daysBeforeEvent');
    expect(prompt).toContain('acyclic dependency graph');
  });

  it('builds vendor prompt with priority and lead weeks', () => {
    const prompt = buildVendorPrompt(sampleContext);
    expect(prompt).toContain(VENDOR_PROMPT_VERSION);
    expect(prompt).toContain('recommendedLeadWeeks');
    expect(prompt).toContain('critical');
  });

  it('builds ideas prompt highlighting dietary and accessibility considerations', () => {
    const prompt = buildIdeasPrompt(sampleContext);
    expect(prompt).toContain(IDEAS_PROMPT_VERSION);
    expect(prompt).toContain('accessibility');
    expect(prompt).toContain('Wheelchair Ramp');
  });

  it('builds chat prompt with tool-calling instructions and sanitized user input', () => {
    const prompt = buildChatPrompt({
      message: 'Can we add a task for ordering cake <script>alert(1)</script>?',
      planSummary: { title: 'Golden Jubilee', budget: 10000 },
      history: [{ role: 'user', content: 'Hi' }],
    });
    expect(prompt).toContain(CHAT_PROMPT_VERSION);
    expect(prompt).toContain('add_task');
    expect(prompt).toContain('update_budget_item');
    expect(prompt).toContain('shortlist_vendor');
    expect(prompt).not.toContain('<script>');
    expect(prompt).toContain('&lt;script&gt;');
  });

  it('constructs retry prompts embedding specific schema validation feedback', () => {
    const err = 'Category "catering" must be a positive number';
    expect(buildBudgetRetryPrompt('ORIGINAL', err)).toContain(err);
    expect(buildTimelineRetryPrompt('ORIGINAL', err)).toContain(err);
    expect(buildVendorRetryPrompt('ORIGINAL', err)).toContain(err);
    expect(buildIdeasRetryPrompt('ORIGINAL', err)).toContain(err);
    expect(buildChatRetryPrompt('ORIGINAL', err)).toContain(err);
  });
});
