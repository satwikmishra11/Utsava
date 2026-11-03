import { describe, it, expect } from 'vitest';
import {
  generateProductionCues,
  filterCuesByRole,
  calculateCueSummary,
} from '../timeline/cueSheet';
import { TimelineItem } from '../types';

const SAMPLE_ITEMS: readonly TimelineItem[] = [
  {
    id: 't-1',
    phase: 'preparation',
    title: 'Sound Check & Audio Monitors',
    time: '10:00',
    durationMinutes: 45,
    completed: true,
  },
  {
    id: 't-2',
    phase: 'ceremony',
    title: 'Grand Entrance of Bride and Groom',
    time: '10:50',
    durationMinutes: 30,
    completed: false,
    assignedTo: 'Emcee John',
  },
  {
    id: 't-3',
    phase: 'ceremony',
    title: 'Formal Ritual & Vows Ceremony',
    time: '11:22',
    durationMinutes: 40,
    completed: false,
  },
  {
    id: 't-4',
    phase: 'reception',
    title: 'Gourmet Dinner Buffet Service',
    time: '12:10',
    durationMinutes: 60,
    completed: false,
  },
];

describe('Production Cue Sheet & Buffer Analysis Domain Logic', () => {
  it('computes transition buffers and flags tight turnarounds accurately', () => {
    const cues = generateProductionCues(SAMPLE_ITEMS, 'wedding');
    expect(cues).toHaveLength(4);

    expect(cues[0]?.bufferMinutesToNext).toBe(5);
    expect(cues[0]?.isTightTurnaround).toBe(true);

    expect(cues[1]?.bufferMinutesToNext).toBe(2);
    expect(cues[1]?.isTightTurnaround).toBe(true);

    expect(cues[2]?.bufferMinutesToNext).toBe(8);
    expect(cues[2]?.isTightTurnaround).toBe(true);

    expect(cues[3]?.bufferMinutesToNext).toBeNull();
    expect(cues[3]?.isTightTurnaround).toBe(false);
  });

  it('assigns appropriate crew roles, lighting cues, and emcee prompts', () => {
    const cues = generateProductionCues(SAMPLE_ITEMS, 'wedding');

    expect(cues[0]?.crewRole).toBe('av_lighting');
    expect(cues[0]?.avLightingCue.toLowerCase()).toContain('sound check');

    expect(cues[1]?.crewRole).toBe('stage_mc');
    expect(cues[1]?.mcPrompt).toContain('welcome for the grand entrance');

    expect(cues[3]?.crewRole).toBe('hospitality');
    expect(cues[3]?.mcPrompt).toContain('enjoy dinner');
  });

  it('filters cues accurately by crew role', () => {
    const cues = generateProductionCues(SAMPLE_ITEMS, 'wedding');

    const avCues = filterCuesByRole(cues, 'av_lighting');
    expect(avCues.every((c) => c.crewRole === 'av_lighting')).toBe(true);

    const mcCues = filterCuesByRole(cues, 'stage_mc');
    expect(mcCues.every((c) => c.crewRole === 'stage_mc')).toBe(true);

    const hospCues = filterCuesByRole(cues, 'hospitality');
    expect(hospCues.every((c) => c.crewRole === 'hospitality')).toBe(true);

    const allCues = filterCuesByRole(cues, 'all');
    expect(allCues).toHaveLength(4);
  });

  it('calculates comprehensive cue summaries', () => {
    const cues = generateProductionCues(SAMPLE_ITEMS, 'wedding');
    const summary = calculateCueSummary(cues);

    expect(summary.totalCues).toBe(4);
    expect(summary.tightTurnaroundsCount).toBe(3);
    expect(summary.avLightingCount).toBe(1);
    expect(summary.stageMcCount).toBe(2);
    expect(summary.hospitalityCount).toBe(1);
  });
});
