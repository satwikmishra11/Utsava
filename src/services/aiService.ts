import { GoogleGenAI } from '@google/genai';
import {
  IdeaRecommendation,
  TimelineItem,
  EventPlan,
  ChatMessage,
  EventType,
} from '../domain/types';
import { detectPromptInjection, buildSecurePromptEnvelope } from '../domain/security';
import { generationCache, GenerationCache } from './cacheService';

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
        await new Promise((r) => setTimeout(r, 10));
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
      description: `A rich visual motif blending traditional floral installations with ambient warm lighting and custom guest favors.`,
      estimatedCostTier: 'medium',
      culturalContext: culturalContext ?? 'Traditional',
      tags: ['decor', 'lighting', 'festive'],
    },
    {
      id: 'idea-2',
      category: 'food_beverage',
      title: 'Curated Artisan Tasting Stations',
      description: 'Interactive live cooking corners featuring regional delicacies and artisanal non-alcoholic craft mocktails.',
      estimatedCostTier: 'medium',
      tags: ['interactive', 'dining', 'culinary'],
    },
    {
      id: 'idea-3',
      category: 'entertainment',
      title: 'Acoustic Fusion Ensemble',
      description: 'Live instrumentalists pairing classical strings with contemporary acoustic beats during guest arrivals.',
      estimatedCostTier: 'low',
      tags: ['live-music', 'welcome', 'acoustic'],
    },
    {
      id: 'idea-4',
      category: 'cultural',
      title: 'Interactive Community Memory Wall',
      description: 'A beautifully illuminated polaroid and note station where attendees leave personalized blessings and photos.',
      estimatedCostTier: 'low',
      tags: ['interactive', 'keepsake', 'sentimental'],
    },
  ];
}

export function buildMockTimeline(
  eventType: EventType,
  startTime: string
): readonly TimelineItem[] {
  const parts = startTime.split(':');
  const h = Number(parts[0] ?? '14');
  const m = Number(parts[1] ?? '00');
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
      time: `${pad(Math.max(0, h - 1))}:${pad(m + 30 > 59 ? m - 30 : m + 30)}`,
      durationMinutes: 30,
      completed: false,
    },
    {
      id: 'gen-t-3',
      phase: 'ceremony',
      title: eventType === 'wedding' ? 'Main Ceremony' : 'Grand Opening & Welcome',
      time: startTime,
      durationMinutes: 60,
      completed: false,
    },
    {
      id: 'gen-t-4',
      phase: 'reception',
      title: 'Dinner Banquet & Celebratory Speeches',
      time: `${pad(h + 1)}:${pad(m + 15 > 59 ? m - 45 : m + 15)}`,
      durationMinutes: 90,
      completed: false,
    },
    {
      id: 'gen-t-5',
      phase: 'teardown',
      title: 'Vendor Teardown & Logistics Wrap-up',
      time: `${pad(h + 3)}:${pad(m)}`,
      durationMinutes: 60,
      completed: false,
    },
  ];
}

export async function generateIdeas(
  params: GenerateIdeasParams
): Promise<readonly IdeaRecommendation[]> {
  const cacheKey = GenerationCache.createHashKey('ideas', params as Record<string, unknown>);
  const cached = generationCache.get<readonly IdeaRecommendation[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || process.env.NODE_ENV === 'test') {
    const mock = buildMockIdeas(params.eventType, params.culturalContext);
    generationCache.set(cacheKey, mock);
    return mock;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate 4 event ideas for a ${params.eventType} with ${params.guestCount} guests. Cultural context: ${params.culturalContext ?? 'general'}. Budget tier: ${params.budgetTier}. Return strictly JSON array matching { id, category, title, description, estimatedCostTier, tags }.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text ?? '[]');
    generationCache.set(cacheKey, parsed);
    return parsed;
  } catch {
    const fallback = buildMockIdeas(params.eventType, params.culturalContext);
    generationCache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function chatWithPlanAssistant(
  userMessage: string,
  eventPlan: EventPlan,
  chatHistory: readonly ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const injection = detectPromptInjection(userMessage);
  if (!injection.isSafe) {
    const refusal = 'I detected an unsafe instruction or attempt to override safety constraints. Please provide an event planning question.';
    return createMockStream(refusal);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || process.env.NODE_ENV === 'test') {
    const mockReply = `Based on your ${eventPlan.title} (${eventPlan.eventType}) with a budget of ${eventPlan.currency} ${eventPlan.totalBudget}, here is an action proposal:

I recommend adding a 10% contingency allocation for miscellaneous unexpected costs to keep you safely on budget.`;
    return createMockStream(mockReply);
  }

  const ai = new GoogleGenAI({ apiKey });
  const envelope = buildSecurePromptEnvelope(
    'You are Utsava, an intelligent, empathetic event planning assistant. Answer the user and propose actionable modifications to their budget, timeline, or vendors if relevant.',
    userMessage,
    JSON.stringify({
      title: eventPlan.title,
      type: eventPlan.eventType,
      budget: eventPlan.totalBudget,
      guestCount: eventPlan.guestCount,
      historyLength: chatHistory.length,
    })
  );

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: envelope,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          controller.enqueue(encoder.encode(chunk.text));
        }
      }
      controller.close();
    },
  });
}
