/**
 * Central orchestrator for generative planning capabilities (budget, timeline, ideas, chat),
 * integrating input guardrails, generation caching, and automated domain fallbacks.
 */

import { getLLMProvider } from '../llm';
import { LLMProvider } from '../llm/types';

import { generationCache } from '../cacheService';
import { createNormalizedHashKey } from './cacheHelper';
import { checkScopeGuardrails } from './guardrails';
import { executeStructuredWithRetry, StructuredExecutionResult } from './structuredExecutor';
import {
  PersonalizationContext,
  GeneratedBudgetPlan,
  GeneratedBudgetPlanSchema,
  GeneratedTimeline,
  GeneratedTimelineSchema,
  GeneratedVendorChecklist,
  GeneratedVendorChecklistSchema,
  GeneratedIdeas,
  GeneratedIdeasSchema,
  ChatAssistantResponse,
  ChatAssistantResponseSchema,
  ToolCall,
} from './types';
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
} from './prompts';
import {
  buildFallbackBudgetPlan,
  buildFallbackTimeline,
  buildFallbackVendorChecklist,
  buildFallbackIdeas,
} from './fallbacks';
import { EventPlan, EventPlanSummary } from '@/domain/types';
import { applyToolCallToPlan } from './planEditor';

import { tokenTracker } from './tokenTracker';

export interface CapabilityOptions {
  readonly provider?: LLMProvider;
  readonly skipCache?: boolean;
}

export function invalidateCapabilityCache(
  capability: 'budget' | 'timeline' | 'vendor' | 'ideas' | 'all',
  context?: PersonalizationContext
): void {
  if (capability === 'all') {
    generationCache.clear();
    return;
  }
  if (context) {
    const key = createNormalizedHashKey(capability, context);
    generationCache.invalidate(key);
  } else {
    generationCache.invalidatePrefix(`${capability}:`);
  }
}

async function trackCapabilityCall<T>(
  capability: 'budget' | 'timeline' | 'vendor' | 'ideas',
  cacheKey: string,
  skipCache: boolean | undefined,
  executor: () => Promise<StructuredExecutionResult<T>>
): Promise<StructuredExecutionResult<T>> {
  if (!skipCache) {
    const cached = generationCache.get<T>(cacheKey);
    if (cached) {
      tokenTracker.record({
        capability,
        promptTokens: 120,
        completionTokens: 200,
        durationMs: 1,
        model: 'generation-cache',
        cached: true,
      });
      return { data: cached, source: 'llm' };
    }
  }

  const start = Date.now();
  const res = await executor();
  const durationMs = Date.now() - start;
  const serialized = JSON.stringify(res.data);
  const completionTokens = Math.max(1, Math.ceil(serialized.length / 4));
  tokenTracker.record({
    capability,
    promptTokens: 250,
    completionTokens,
    durationMs,
    model: res.source === 'fallback' ? 'fallback-template' : 'claude-3-5-sonnet',
    cached: false,
  });

  generationCache.set(cacheKey, res.data);
  return res;
}

export async function generateBudgetPlan(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedBudgetPlan>> {
  const cacheKey = createNormalizedHashKey('budget', context);
  const provider = options?.provider ?? getLLMProvider();
  return trackCapabilityCall('budget', cacheKey, options?.skipCache, () =>
    executeStructuredWithRetry({
      provider,
      prompt: buildBudgetPrompt(context),
      schema: GeneratedBudgetPlanSchema,
      buildRetryPrompt: buildBudgetRetryPrompt,
      fallback: () => buildFallbackBudgetPlan(context),
    })
  );
}

export async function generateTimeline(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedTimeline>> {
  const cacheKey = createNormalizedHashKey('timeline', context);
  const provider = options?.provider ?? getLLMProvider();
  return trackCapabilityCall('timeline', cacheKey, options?.skipCache, () =>
    executeStructuredWithRetry({
      provider,
      prompt: buildTimelinePrompt(context),
      schema: GeneratedTimelineSchema,
      buildRetryPrompt: buildTimelineRetryPrompt,
      fallback: () => buildFallbackTimeline(context),
    })
  );
}

export async function generateVendorChecklist(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedVendorChecklist>> {
  const cacheKey = createNormalizedHashKey('vendor', context);
  const provider = options?.provider ?? getLLMProvider();
  return trackCapabilityCall('vendor', cacheKey, options?.skipCache, () =>
    executeStructuredWithRetry({
      provider,
      prompt: buildVendorPrompt(context),
      schema: GeneratedVendorChecklistSchema,
      buildRetryPrompt: buildVendorRetryPrompt,
      fallback: () => buildFallbackVendorChecklist(context),
    })
  );
}

export async function generateIdeas(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedIdeas>> {
  const cacheKey = createNormalizedHashKey('ideas', context);
  const provider = options?.provider ?? getLLMProvider();
  return trackCapabilityCall('ideas', cacheKey, options?.skipCache, () =>
    executeStructuredWithRetry({
      provider,
      prompt: buildIdeasPrompt(context),
      schema: GeneratedIdeasSchema,
      buildRetryPrompt: buildIdeasRetryPrompt,
      fallback: () => buildFallbackIdeas(context),
    })
  );
}

function createTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.match(/.{1,20}/g) ?? [text];
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

export interface ChatAssistantParams {
  readonly message: string;
  readonly eventPlan: EventPlanSummary;
  readonly chatHistory?: readonly { readonly role: string; readonly content: string }[];
  readonly provider?: LLMProvider;
}

export interface ChatAssistantResult {
  readonly replyText: string;
  readonly stream: ReadableStream<Uint8Array>;
  readonly toolCalls: readonly ToolCall[];
  readonly updatedPlan?: EventPlan;
}

function applyToolsToPlan(
  plan: EventPlan | undefined,
  tools: readonly ToolCall[]
): EventPlan | undefined {
  if (!plan) return undefined;
  return tools.reduce((acc, tool) => applyToolCallToPlan(acc, tool), plan);
}

function eventPlanSummaryToRecord(summary: EventPlanSummary): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(summary)) {
    record[key] = value;
  }
  return record;
}

export async function executeChatAssistant(
  params: ChatAssistantParams,
  fullPlanToEdit?: EventPlan
): Promise<ChatAssistantResult> {
  const guardrail = checkScopeGuardrails(params.message);
  if (!guardrail.isAllowed) {
    const refusal = guardrail.refusalMessage ?? '';
    return { replyText: refusal, stream: createTextStream(refusal), toolCalls: [] };
  }

  const provider = params.provider ?? getLLMProvider();
  const prompt = buildChatPrompt({
    message: params.message,
    planSummary: eventPlanSummaryToRecord(params.eventPlan),
    history: params.chatHistory,
  });

  const res = await executeStructuredWithRetry<ChatAssistantResponse>({
    provider,
    prompt,
    schema: ChatAssistantResponseSchema,
    buildRetryPrompt: buildChatRetryPrompt,
    fallback: () => ({
      reply: `I can help update your ${params.eventPlan.title} plan! I've noted your request regarding ${params.message.slice(0, 30)}.`,
      toolCalls: [],
    }),
  });

  return {
    replyText: res.data.reply,
    stream: createTextStream(res.data.reply),
    toolCalls: res.data.toolCalls,
    updatedPlan: applyToolsToPlan(fullPlanToEdit, res.data.toolCalls),
  };
}
