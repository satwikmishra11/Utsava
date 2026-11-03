import { TimelineItem, TimelinePhase } from '../types';
import { EventType } from '../schemas';
import { timeStringToMinutes, sortTimelineChronologically } from './operations';

export type CueCrewRole = 'all' | 'av_lighting' | 'stage_mc' | 'hospitality';

export interface ProductionCue {
  readonly id: string;
  readonly time: string;
  readonly phase: TimelinePhase;
  readonly title: string;
  readonly assignedTo: string;
  readonly crewRole: Exclude<CueCrewRole, 'all'>;
  readonly avLightingCue: string;
  readonly mcPrompt: string;
  readonly bufferMinutesToNext: number | null;
  readonly isTightTurnaround: boolean;
}

export interface ProductionCueSummary {
  readonly totalCues: number;
  readonly tightTurnaroundsCount: number;
  readonly avLightingCount: number;
  readonly stageMcCount: number;
  readonly hospitalityCount: number;
}

const AV_KEYWORDS = ['audio', 'sound', 'mic', 'dj', 'light', 'music', 'photo'] as const;
const HOSPITALITY_KEYWORDS = ['dinner', 'cake', 'buffet', 'catering', 'snack', 'bar'] as const;

function hasKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function resolveCrewRole(phase: TimelinePhase, title: string): Exclude<CueCrewRole, 'all'> {
  const lower = title.toLowerCase();
  if (hasKeyword(lower, AV_KEYWORDS)) return 'av_lighting';
  if (hasKeyword(lower, HOSPITALITY_KEYWORDS)) return 'hospitality';
  if (phase === 'ceremony' || phase === 'reception') return 'stage_mc';
  return 'av_lighting';
}

function matchEntryCue(lower: string): string | null {
  if (lower.includes('entry') || lower.includes('arrival') || lower.includes('baraat')) {
    return 'Warm spotlight on entrance; fade background track to 30%, punch entry anthem.';
  }
  return null;
}

function matchCeremonyCue(lower: string): string | null {
  if (lower.includes('cake') || lower.includes('toast') || lower.includes('speech')) {
    return 'Stage wash at 80%; mute ambient stems; activate primary wireless mic 1 & 2.';
  }
  if (lower.includes('ceremony') || lower.includes('ritual') || lower.includes('vow')) {
    return 'Amber ceremony wash; subtle instrumental acoustics at -18dB; record master mix.';
  }
  return null;
}

function generateAvLightingCue(phase: TimelinePhase, title: string, eventType: EventType): string {
  const lower = title.toLowerCase();
  const entry = matchEntryCue(lower);
  if (entry) return entry;
  const ceremony = matchCeremonyCue(lower);
  if (ceremony) return ceremony;
  if (phase === 'reception') {
    return 'Full dynamic stage rig; party lighting sequence; live DJ audio feed active.';
  }
  if (phase === 'preparation') {
    return 'House work lights 100%; sound check monitors, wireless channels, and projector.';
  }
  return `Preset lighting scene for ${eventType}; monitor wireless mic audio headroom.`;
}

function generateMcPrompt(phase: TimelinePhase, title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('entrance') || lower.includes('entry') || lower.includes('arrival')) {
    return 'Ladies and gentlemen, let us raise our energy and give a warm welcome for the grand entrance!';
  }
  if (lower.includes('dinner') || lower.includes('buffet')) {
    return 'We invite all our esteemed guests to enjoy dinner. Our team is ready to serve you!';
  }
  if (lower.includes('cake')) {
    return 'Join us gathered around the main stage as we celebrate with the cake cutting ceremony!';
  }
  if (lower.includes('toast') || lower.includes('speech')) {
    return 'Please welcome our next speaker to the stage with a warm round of applause.';
  }
  if (phase === 'ceremony') {
    return 'Please silence your mobile devices as we begin our formal ceremony proceedings.';
  }
  return `Announce transition: "${title}". Guide guests to designated seating area.`;
}

function buildCueItem(
  item: TimelineItem,
  nextItem: TimelineItem | undefined,
  eventType: EventType
): ProductionCue {
  const crewRole = resolveCrewRole(item.phase, item.title);
  const avLightingCue = generateAvLightingCue(item.phase, item.title, eventType);
  const mcPrompt = generateMcPrompt(item.phase, item.title);

  let bufferMinutesToNext: number | null = null;
  let isTightTurnaround = false;

  if (nextItem) {
    const currentEnd = timeStringToMinutes(item.time) + item.durationMinutes;
    const nextStart = timeStringToMinutes(nextItem.time);
    bufferMinutesToNext = nextStart - currentEnd;
    isTightTurnaround = bufferMinutesToNext < 10;
  }

  return Object.freeze({
    id: `cue-${item.id}`,
    time: item.time,
    phase: item.phase,
    title: item.title,
    assignedTo: item.assignedTo ?? 'Production Lead',
    crewRole,
    avLightingCue,
    mcPrompt,
    bufferMinutesToNext,
    isTightTurnaround,
  });
}

export function generateProductionCues(
  items: readonly TimelineItem[],
  eventType: EventType
): readonly ProductionCue[] {
  const sorted = sortTimelineChronologically(items);
  return sorted.map((item, idx) => buildCueItem(item, sorted[idx + 1], eventType));
}

export function filterCuesByRole(
  cues: readonly ProductionCue[],
  role: CueCrewRole
): readonly ProductionCue[] {
  if (role === 'all') return cues;
  return cues.filter((cue) => cue.crewRole === role);
}

export function calculateCueSummary(cues: readonly ProductionCue[]): ProductionCueSummary {
  const tightTurnaroundsCount = cues.filter((c) => c.isTightTurnaround).length;
  const avLightingCount = cues.filter((c) => c.crewRole === 'av_lighting').length;
  const stageMcCount = cues.filter((c) => c.crewRole === 'stage_mc').length;
  const hospitalityCount = cues.filter((c) => c.crewRole === 'hospitality').length;

  return {
    totalCues: cues.length,
    tightTurnaroundsCount,
    avLightingCount,
    stageMcCount,
    hospitalityCount,
  };
}
