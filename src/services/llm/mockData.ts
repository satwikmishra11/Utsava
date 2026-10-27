import { IdeaRecommendation, TimelineItem } from '../../domain/types';
import { EventType } from '../../domain/schemas';

export function createMockStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.match(/.{1,16}/g) ?? [text];

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 5));
      }
      controller.close();
    },
  });
}

const createIdea = (
  id: string,
  category: IdeaRecommendation['category'],
  title: string,
  description: string,
  estimatedCostTier: 'low' | 'medium' | 'high',
  tags: string[],
  culturalContext?: string
): IdeaRecommendation => ({
  id,
  category,
  title,
  description,
  estimatedCostTier,
  tags,
  ...(culturalContext ? { culturalContext } : {}),
});

const MOCK_EXPERIENCE_IDEAS = [
  createIdea(
    'idea-2',
    'food_beverage',
    'Curated Artisan Tasting Stations',
    'Interactive live cooking corners featuring regional delicacies and craft mocktails.',
    'medium',
    ['interactive', 'dining', 'culinary']
  ),
  createIdea(
    'idea-3',
    'entertainment',
    'Acoustic Fusion Ensemble',
    'Live instrumentalists pairing classical strings with contemporary acoustic beats.',
    'low',
    ['live-music', 'welcome', 'acoustic']
  ),
  createIdea(
    'idea-4',
    'cultural',
    'Interactive Community Memory Wall',
    'An illuminated polaroid station where attendees leave personalized blessings and photos.',
    'low',
    ['interactive', 'keepsake', 'sentimental']
  ),
];

export function buildMockIdeas(
  eventType: EventType,
  culturalContext?: string
): readonly IdeaRecommendation[] {
  const prefix = culturalContext ? `${culturalContext} ` : '';
  const themeTitle = `${prefix}${eventType === 'wedding' ? 'Royal Heritage' : 'Sunset Radiance'} Theme`;
  const themeIdea = createIdea(
    'idea-1',
    'theme',
    themeTitle,
    'A rich visual motif blending traditional floral installations with ambient warm lighting.',
    'medium',
    ['decor', 'lighting', 'festive'],
    culturalContext ?? 'Traditional'
  );
  return [themeIdea, ...MOCK_EXPERIENCE_IDEAS];
}

const createTimelineItem = (
  id: string,
  phase: TimelineItem['phase'],
  title: string,
  time: string,
  durationMinutes: number
): TimelineItem => ({ id, phase, title, time, durationMinutes, completed: false });

export function buildMockTimeline(
  eventType: EventType,
  startTime: string
): readonly TimelineItem[] {
  const [hStr = '14', mStr = '00'] = startTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (offsetH: number) => `${pad(Math.max(0, h + offsetH))}:${pad(m)}`;

  return [
    createTimelineItem('gen-t-1', 'preparation', 'Vendor Check-in & Floral Setup', fmt(-2), 90),
    createTimelineItem('gen-t-2', 'preparation', 'Soundcheck & Lighting Calibration', fmt(-1), 30),
    createTimelineItem(
      'gen-t-3',
      'ceremony',
      eventType === 'wedding' ? 'Main Ceremony' : 'Grand Opening',
      startTime,
      60
    ),
    createTimelineItem('gen-t-4', 'reception', 'Dinner Banquet & Speeches', fmt(1), 90),
    createTimelineItem('gen-t-5', 'teardown', 'Logistics Wrap-up', fmt(3), 60),
  ];
}
