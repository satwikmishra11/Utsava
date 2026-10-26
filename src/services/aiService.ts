import { IdeaRecommendation, EventPlanSummary, EventType } from '../domain/types';
import { executeChatAssistant, generateIdeas as generateIdeasCapability } from './ai';

export interface GenerateIdeasParams {
  readonly eventType: EventType;
  readonly guestCount: number;
  readonly budgetTier: 'budget' | 'moderate' | 'luxury';
  readonly culturalContext?: string;
  readonly existingTags?: readonly string[];
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
