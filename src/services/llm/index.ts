/**
 * LLM provider factory and resolution entry point for Utsava.
 */

import { z } from 'zod';
import { env, Env } from '@/lib/env';
import { LLMProvider, LLMOptions } from './types';
import { MockProvider } from './mockProvider';
import { ClaudeProvider } from './claudeProvider';
import { GeminiProvider } from './geminiProvider';
import { resolveProviderName, ResolverEnv } from './resolveProvider';

export * from './types';
export * from './mockProvider';
export * from './claudeProvider';
export * from './geminiProvider';
export * from './resolveProvider';
export * from './json';

export interface CreateLLMProviderOptions {
  readonly providerName?: 'auto' | 'gemini' | 'claude' | 'mock' | string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly injectedProvider?: LLMProvider;
  readonly envOverride?: Partial<Env>;
}

let activeDefaultProvider: LLMProvider | null = null;

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  for (const val of values) {
    if (val) return val;
  }
  return undefined;
}

function resolveTargetProvider(options: CreateLLMProviderOptions): ResolverEnv['LLM_PROVIDER'] {
  const target = firstNonEmpty(
    options.providerName,
    options.envOverride?.LLM_PROVIDER,
    env.LLM_PROVIDER
  );
  if (target === 'gemini' || target === 'claude' || target === 'mock') {
    return target;
  }
  return 'auto';
}

function resolveProviderApiKey(
  provider: ResolverEnv['LLM_PROVIDER'],
  options: CreateLLMProviderOptions
): { geminiKey?: string; claudeKey?: string } {
  const geminiCandidate = firstNonEmpty(
    options.apiKey,
    options.envOverride?.GEMINI_API_KEY,
    env.GEMINI_API_KEY
  );
  const claudeCandidate = firstNonEmpty(
    options.apiKey,
    options.envOverride?.ANTHROPIC_API_KEY,
    env.ANTHROPIC_API_KEY
  );

  if (provider === 'gemini') {
    return { geminiKey: geminiCandidate };
  }
  if (provider === 'claude') {
    return { claudeKey: claudeCandidate };
  }
  return {
    geminiKey: geminiCandidate,
    claudeKey: options.envOverride?.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY,
  };
}

function buildResolverEnv(options: CreateLLMProviderOptions): ResolverEnv {
  const provider = resolveTargetProvider(options);
  const keys = resolveProviderApiKey(provider, options);

  return {
    NODE_ENV: options.envOverride?.NODE_ENV || env.NODE_ENV,
    LLM_PROVIDER: provider,
    GEMINI_API_KEY: keys.geminiKey,
    ANTHROPIC_API_KEY: keys.claudeKey,
    ALLOW_DEMO_MODE: options.envOverride?.ALLOW_DEMO_MODE ?? env.ALLOW_DEMO_MODE,
  };
}

function instantiateLiveProvider(
  resolutionName: 'gemini' | 'claude',
  resolverEnv: ResolverEnv,
  options: CreateLLMProviderOptions
): LLMProvider {
  if (resolutionName === 'gemini') {
    const model = firstNonEmpty(options.model, options.envOverride?.GEMINI_MODEL, env.GEMINI_MODEL);
    return new GeminiProvider(resolverEnv.GEMINI_API_KEY, model);
  }
  const model = firstNonEmpty(
    options.model,
    options.envOverride?.ANTHROPIC_MODEL,
    env.ANTHROPIC_MODEL
  );
  return new ClaudeProvider(resolverEnv.ANTHROPIC_API_KEY, model);
}

/**
 * Instantiates the appropriate LLM provider based on validated configuration and options.
 *
 * @param options - Instantiation and dependency injection options.
 * @returns Configured LLMProvider instance.
 */
export function createLLMProvider(options: CreateLLMProviderOptions = {}): LLMProvider {
  if (options.injectedProvider) {
    return options.injectedProvider;
  }

  const resolverEnv = buildResolverEnv(options);
  const resolution = resolveProviderName(resolverEnv);

  if (resolution.name === 'gemini' || resolution.name === 'claude') {
    return instantiateLiveProvider(resolution.name, resolverEnv, options);
  }

  return new MockProvider();
}

/**
 * Overrides the default LLM provider instance, primarily for unit test isolation.
 *
 * @param provider - Mock or custom provider to use globally, or null to reset.
 */
export function setDefaultLLMProvider(provider: LLMProvider | null): void {
  activeDefaultProvider = provider;
}

/**
 * Retrieves the currently active LLM provider.
 *
 * @param providerName - Optional explicit provider name override.
 * @returns Active LLMProvider instance.
 */
export function getLLMProvider(providerName?: string): LLMProvider {
  if (providerName) {
    return createLLMProvider({ providerName });
  }
  return activeDefaultProvider ?? createLLMProvider();
}

/**
 * Default lazy LLM provider instance delegating to the dynamically configured active provider.
 */
export const defaultLLMProvider: LLMProvider = {
  get name(): string {
    return getLLMProvider().name;
  },
  generateText(prompt: string, options?: LLMOptions): Promise<string> {
    return getLLMProvider().generateText(prompt, options);
  },
  streamText(prompt: string, options?: LLMOptions): Promise<ReadableStream<string>> {
    return getLLMProvider().streamText(prompt, options);
  },
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options?: LLMOptions
  ): Promise<T> {
    return getLLMProvider().generateStructured(prompt, schema, options);
  },
};
