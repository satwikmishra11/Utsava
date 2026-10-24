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

export interface CapabilityOptions {
  readonly provider?: LLMProvider;
  readonly skipCache?: boolean;
}

export async function generateBudgetPlan(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedBudgetPlan>> {
  const cacheKey = createNormalizedHashKey('budget', context);
  if (!options?.skipCache) {
    const cached = generationCache.get<GeneratedBudgetPlan>(cacheKey);
    if (cached) return { data: cached, source: 'llm' };
  }

  const provider = options?.provider ?? getLLMProvider();
  const res = await executeStructuredWithRetry({
    provider,
    prompt: buildBudgetPrompt(context),
    schema: GeneratedBudgetPlanSchema,
    buildRetryPrompt: buildBudgetRetryPrompt,
    fallback: () => buildFallbackBudgetPlan(context),
  });

  generationCache.set(cacheKey, res.data);
  return res;
}

export async function generateTimeline(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedTimeline>> {
  const cacheKey = createNormalizedHashKey('timeline', context);
  if (!options?.skipCache) {
    const cached = generationCache.get<GeneratedTimeline>(cacheKey);
    if (cached) return { data: cached, source: 'llm' };
  }

  const provider = options?.provider ?? getLLMProvider();
  const res = await executeStructuredWithRetry({
    provider,
    prompt: buildTimelinePrompt(context),
    schema: GeneratedTimelineSchema,
    buildRetryPrompt: buildTimelineRetryPrompt,
    fallback: () => buildFallbackTimeline(context),
  });

  generationCache.set(cacheKey, res.data);
  return res;
}

export async function generateVendorChecklist(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedVendorChecklist>> {
  const cacheKey = createNormalizedHashKey('vendor', context);
  if (!options?.skipCache) {
    const cached = generationCache.get<GeneratedVendorChecklist>(cacheKey);
    if (cached) return { data: cached, source: 'llm' };
  }

  const provider = options?.provider ?? getLLMProvider();
  const res = await executeStructuredWithRetry({
    provider,
    prompt: buildVendorPrompt(context),
    schema: GeneratedVendorChecklistSchema,
    buildRetryPrompt: buildVendorRetryPrompt,
    fallback: () => buildFallbackVendorChecklist(context),
  });

  generationCache.set(cacheKey, res.data);
  return res;
}

export async function generateIdeas(
  context: PersonalizationContext,
  options?: CapabilityOptions
): Promise<StructuredExecutionResult<GeneratedIdeas>> {
  const cacheKey = createNormalizedHashKey('ideas', context);
  if (!options?.skipCache) {
    const cached = generationCache.get<GeneratedIdeas>(cacheKey);
    if (cached) return { data: cached, source: 'llm' };
  }

  const provider = options?.provider ?? getLLMProvider();
  const res = await executeStructuredWithRetry({
    provider,
    prompt: buildIdeasPrompt(context),
    schema: GeneratedIdeasSchema,
    buildRetryPrompt: buildIdeasRetryPrompt,
    fallback: () => buildFallbackIdeas(context),
  });

  generationCache.set(cacheKey, res.data);
  return res;
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

export async function executeChatAssistant(
  params: ChatAssistantParams,
  fullPlanToEdit?: EventPlan
): Promise<ChatAssistantResult> {
  const guardrail = checkScopeGuardrails(params.message);
  if (!guardrail.isAllowed) {
    const refusal = guardrail.refusalMessage!;
    return { replyText: refusal, stream: createTextStream(refusal), toolCalls: [] };
  }

  const provider = params.provider ?? getLLMProvider();
  const prompt = buildChatPrompt({
    message: params.message,
    planSummary: params.eventPlan as unknown as Record<string, unknown>,
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

  let updatedPlan = fullPlanToEdit;
  if (updatedPlan) {
    for (const tool of res.data.toolCalls) {
      updatedPlan = applyToolCallToPlan(updatedPlan, tool);
    }
  }

  return {
    replyText: res.data.reply,
    stream: createTextStream(res.data.reply),
    toolCalls: res.data.toolCalls,
    updatedPlan,
  };
}
