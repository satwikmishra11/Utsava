import { LLMProvider } from './types';
import { MockProvider } from './mockProvider';
import { ClaudeProvider } from './claudeProvider';

export * from './types';
export * from './mockProvider';
export * from './claudeProvider';

export interface LLMProviderOptions {
  readonly providerName?: string;
  readonly apiKey?: string;
}

export function createLLMProvider(options: LLMProviderOptions = {}): LLMProvider {
  const selected = options.providerName ?? process.env.LLM_PROVIDER ?? 'mock';
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;

  if (selected === 'claude' && apiKey) {
    return new ClaudeProvider(apiKey);
  }

  return new MockProvider();
}

export function getLLMProvider(providerName?: string): LLMProvider {
  return createLLMProvider({ providerName });
}

export const defaultLLMProvider: LLMProvider = getLLMProvider();
