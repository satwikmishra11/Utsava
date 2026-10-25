import { describe, it, expect } from 'vitest';
import {
  DEMO_EVENTS,
  DEMO_INDIAN_WEDDING,
  DEMO_CHILD_BIRTHDAY,
  DEMO_COMMUNITY_FUNDRAISER,
  getDemoEventByType,
  getDemoEventById,
} from '../demoEvents';

describe('demoEvents domain tests', () => {
  it('contains exactly 3 preconfigured demo events', () => {
    expect(DEMO_EVENTS).toHaveLength(3);
    expect(DEMO_EVENTS[0]?.id).toBe('evt-demo-wedding');
    expect(DEMO_EVENTS[1]?.id).toBe('evt-demo-birthday');
    expect(DEMO_EVENTS[2]?.id).toBe('evt-demo-community');
  });

  it('retrieves demo events by type correctly', () => {
    expect(getDemoEventByType('wedding')).toBe(DEMO_INDIAN_WEDDING);
    expect(getDemoEventByType('birthday')).toBe(DEMO_CHILD_BIRTHDAY);
    expect(getDemoEventByType('community')).toBe(DEMO_COMMUNITY_FUNDRAISER);
  });

  it('retrieves demo events by id and handles unknown ids', () => {
    expect(getDemoEventById('evt-demo-wedding')).toBe(DEMO_INDIAN_WEDDING);
    expect(getDemoEventById('evt-demo-birthday')).toBe(DEMO_CHILD_BIRTHDAY);
    expect(getDemoEventById('evt-demo-community')).toBe(DEMO_COMMUNITY_FUNDRAISER);
    expect(getDemoEventById('non-existent-id')).toBeUndefined();
  });

  it('ensures all demo events have valid budgets, timelines, vendors, and ideas', () => {
    for (const evt of DEMO_EVENTS) {
      expect(evt.totalBudget).toBeGreaterThan(0);
      expect(evt.guestCount).toBeGreaterThan(0);
      expect(evt.budgetItems.length).toBeGreaterThan(0);
      expect(evt.timelineItems.length).toBeGreaterThan(0);
      expect(evt.vendors.length).toBeGreaterThan(0);
      expect(evt.ideas.length).toBeGreaterThan(0);

      // Verify budget items sum does not grossly mismatch total
      const totalEstimated = evt.budgetItems.reduce((acc, item) => acc + item.estimated, 0);
      expect(totalEstimated).toBeGreaterThan(0);
      expect(totalEstimated).toBeLessThanOrEqual(evt.totalBudget * 1.5);
    }
  });

  it('verifies accessibility and dietary accommodations in wedding and community events', () => {
    expect(DEMO_INDIAN_WEDDING.culturalContext).toContain('South Asian');
    expect(DEMO_CHILD_BIRTHDAY.culturalContext).toContain('Kids Wildlife Explorer');
    expect(DEMO_COMMUNITY_FUNDRAISER.culturalContext).toContain('Civic Neighborhood');

    const communityAccessibilityTask = DEMO_COMMUNITY_FUNDRAISER.timelineItems.find(
      (t) => t.title.includes('ADA Ramp') || t.notes?.includes('wheelchair')
    );
    expect(communityAccessibilityTask).toBeDefined();

    const weddingDietaryItem = DEMO_INDIAN_WEDDING.budgetItems.find((b) =>
      b.notes?.includes('Jain & Halal')
    );
    expect(weddingDietaryItem).toBeDefined();
  });
});
