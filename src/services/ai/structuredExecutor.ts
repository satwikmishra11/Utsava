/**
 * Executes structured LLM generations with automatic corrective feedback loops,
 * repairing schema deviations before safely degrading to deterministic fallbacks.
 */

import { z } from 'zod';
import { LLMProvider, LLMOptions } from '../llm/types';

export interface ExecuteStructuredOptions<T> {
  readonly provider: LLMProvider;
  readonly prompt: string;
  readonly schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  readonly buildRetryPrompt: (originalPrompt: string, validationErrors: string) => string;
  readonly fallback: () => T;
  readonly llmOptions?: LLMOptions;
}

export interface StructuredExecutionResult<T> {
  readonly data: T;
  readonly source: 'llm' | 'retry' | 'fallback';
  readonly error?: string;
}

async function attemptStructured<T>(
  provider: LLMProvider,
  prompt: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  options?: LLMOptions
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const raw = await provider.generateStructured(prompt, schema, options);
    const parsed = schema.safeParse(raw);
    if (parsed.success) return { success: true, data: parsed.data };
    return { success: false, error: JSON.stringify(parsed.error.format()) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function executeStructuredWithRetry<T>(
  opts: ExecuteStructuredOptions<T>
): Promise<StructuredExecutionResult<T>> {
  const first = await attemptStructured(opts.provider, opts.prompt, opts.schema, opts.llmOptions);
  if (first.success) {
    return { data: first.data, source: 'llm' };
  }

  const retryPrompt = opts.buildRetryPrompt(opts.prompt, first.error);
  const second = await attemptStructured(opts.provider, retryPrompt, opts.schema, opts.llmOptions);
  if (second.success) {
    return { data: second.data, source: 'retry' };
  }

  return {
    data: opts.fallback(),
    source: 'fallback',
    error: `Primary attempt failed (${first.error}), retry attempt failed (${second.error})`,
  };
}
