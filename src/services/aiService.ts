import { IdeaRecommendation, TimelineItem, EventPlanSummary, EventType } from '../domain/types';
import { executeChatAssistant, generateIdeas as generateIdeasCapability } from './ai';

export interface GenerateIdeasParams {
  readonly eventType: EventType;
  readonly guestCount: number;
  readonly budgetTier: 'budget' | 'moderate' | 'luxury';
  readonly culturalContext?: string;
  readonly existingTags?: readonly string[];
}

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

export function buildMockIdeas(
  eventType: EventType,
  culturalContext?: string
): readonly IdeaRecommendation[] {
  const prefix = culturalContext ? `${culturalContext} ` : '';
  return [
    {
      id: 'idea-1',
      category: 'theme',
      title: `${prefix}${eventType === 'wedding' ? 'Royal Heritage' : 'Sunset Radiance'} Theme`,
      description: `A rich visual motif blending traditional floral installations with ambient warm lighting.`,
      estimatedCostTier: 'medium',
      culturalContext: culturalContext ?? 'Traditional',
      tags: ['decor', 'lighting', 'festive'],
    },
    {
      id: 'idea-2',
      category: 'food_beverage',
      title: 'Curated Artisan Tasting Stations',
      description:
        'Interactive live cooking corners featuring regional delicacies and craft mocktails.',
      estimatedCostTier: 'medium',
      tags: ['interactive', 'dining', 'culinary'],
    },
    {
      id: 'idea-3',
      category: 'entertainment',
      title: 'Acoustic Fusion Ensemble',
      description:
        'Live instrumentalists pairing classical strings with contemporary acoustic beats.',
      estimatedCostTier: 'low',
      tags: ['live-music', 'welcome', 'acoustic'],
    },
    {
      id: 'idea-4',
      category: 'cultural',
      title: 'Interactive Community Memory Wall',
      description:
        'An illuminated polaroid station where attendees leave personalized blessings and photos.',
      estimatedCostTier: 'low',
      tags: ['interactive', 'keepsake', 'sentimental'],
    },
  ];
}

export function buildMockTimeline(
  eventType: EventType,
  startTime: string
): readonly TimelineItem[] {
  const [hStr = '14', mStr = '00'] = startTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const pad = (n: number) => n.toString().padStart(2, '0');

  return [
    {
      id: 'gen-t-1',
      phase: 'preparation',
      title: 'Vendor Check-in & Floral Setup',
      time: `${pad(Math.max(0, h - 2))}:${pad(m)}`,
      durationMinutes: 90,
      completed: false,
    },
    {
      id: 'gen-t-2',
      phase: 'preparation',
      title: 'Soundcheck & Lighting Calibration',
      time: `${pad(Math.max(0, h - 1))}:${pad(m)}`,
      durationMinutes: 30,
      completed: false,
    },
    {
      id: 'gen-t-3',
      phase: 'ceremony',
      title: eventType === 'wedding' ? 'Main Ceremony' : 'Grand Opening',
      time: startTime,
      durationMinutes: 60,
      completed: false,
    },
    {
      id: 'gen-t-4',
      phase: 'reception',
      title: 'Dinner Banquet & Speeches',
      time: `${pad(h + 1)}:${pad(m)}`,
      durationMinutes: 90,
      completed: false,
    },
    {
      id: 'gen-t-5',
      phase: 'teardown',
      title: 'Logistics Wrap-up',
      time: `${pad(h + 3)}:${pad(m)}`,
      durationMinutes: 60,
      completed: false,
    },
  ];
}

export async function generateIdeas(
  params: GenerateIdeasParams
): Promise<readonly IdeaRecommendation[]> {
  const result = await generateIdeasCapability({
    eventType: params.eventType,
    guestCount: params.guestCount,
    budgetBand: params.budgetTier,
    culture: params.culturalContext,
    dietary: [],
    accessibilityNeeds: [],
  });
  return result.data.ideas;
}

export interface ChatHistoryEntry {
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
}

export async function chatWithPlanAssistant(
  userMessage: string,
  eventPlan: EventPlanSummary,
  chatHistory: readonly ChatHistoryEntry[]
): Promise<ReadableStream<Uint8Array>> {
  const result = await executeChatAssistant({
    message: userMessage,
    eventPlan,
    chatHistory,
  });
  return result.stream;
}
