import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  copyToClipboard,
  exportBudgetToCSV,
  exportTimelineToCSV,
  exportVendorsToCSV,
  exportPlanToJSON,
  parsePlanFromJSON,
  generateEventBriefText,
} from '../exportUtils';
import { EventPlan } from '@/domain/types';

const TEST_PLAN: EventPlan = {
  id: 'evt-test-export',
  title: 'Royal Gala Celebration',
  eventType: 'wedding',
  date: '2026-11-20',
  guestCount: 150,
  totalBudget: 45000,
  currency: 'INR',
  culturalContext: 'Contemporary Royal',
  dietary: ['Vegetarian', 'Jain'],
  accessibilityNeeds: ['Wheelchair Ramp'],
  budgetItems: [
    {
      id: 'b-1',
      eventId: 'evt-test-export',
      category: 'venue',
      notes: 'Palace Grounds',
      estimated: 20000,
      actual: 20000,
    },
    {
      id: 'b-2',
      eventId: 'evt-test-export',
      category: 'catering',
      notes: 'Royal Feast Banquet',
      estimated: 15000,
      actual: 0,
    },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'ceremony',
      title: 'Grand Procession',
      time: '16:00',
      durationMinutes: 90,
      completed: true,
      assignedTo: 'Lead Coordinator',
      location: 'Grand Courtyard',
      notes: 'Ensure royal trumpet fanfare',
    },
  ],
  vendors: [
    {
      id: 'v-1',
      category: 'catering',
      name: 'Spice & Silk Catering',
      status: 'booked',
      quotedAmount: 15000,
      contactEmail: 'chef@spicesilk.test',
      contactPhone: '+91 98765 43210',
      deliverables: ['Live Chaat Counter', '3-Course Dinner'],
      notes: 'Includes Jain options',
    },
  ],
  ideas: [],
};

describe('exportUtils Professional Data Export Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('exports budget to CSV with headers, line items, and summary row', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    exportBudgetToCSV(TEST_PLAN);

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('exports timeline run-of-show to CSV', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    exportTimelineToCSV(TEST_PLAN);
    expect(appendSpy).toHaveBeenCalled();
  });

  it('exports vendor procurement directory to CSV', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    exportVendorsToCSV(TEST_PLAN);
    expect(appendSpy).toHaveBeenCalled();
  });

  it('exports full plan to JSON and restores it with parsePlanFromJSON', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    exportPlanToJSON(TEST_PLAN);
    expect(appendSpy).toHaveBeenCalled();

    const jsonStr = JSON.stringify(TEST_PLAN);
    const restored = parsePlanFromJSON(jsonStr);

    expect(restored.id).toBe(TEST_PLAN.id);
    expect(restored.title).toBe(TEST_PLAN.title);
    expect(restored.budgetItems).toHaveLength(2);
    expect(restored.vendors).toHaveLength(1);
    expect(restored.timelineItems).toHaveLength(1);
  });

  it('rejects invalid JSON string or missing required fields in parsePlanFromJSON', () => {
    expect(() => parsePlanFromJSON('not-json')).toThrow();
    expect(() => parsePlanFromJSON(JSON.stringify({ notTitle: true }))).toThrowError(
      /Missing required event plan properties/
    );
  });

  it('generates structured event brief text containing key metrics', () => {
    const brief = generateEventBriefText(TEST_PLAN);
    expect(brief).toContain('ROYAL GALA CELEBRATION');
    expect(brief).toContain('Guests: 150');
    expect(brief).toContain('Grand Procession');
    expect(brief).toContain('Spice & Silk Catering');
    expect(brief).toContain('Dietary: Vegetarian, Jain');
  });

  it('copies text to clipboard safely', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    const result = await copyToClipboard('test copy');
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('test copy');
  });
});
