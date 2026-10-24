import { LLMProvider } from './types';
import { MockProvider } from './mockProvider';
import { ClaudeProvider } from './claudeProvider';

export * from './types';
export * from './mockProvider';
export * from './claudeProvider';

export function getLLMProvider(providerName?: string): LLMProvider {
  const selected = providerName ?? process.env.LLM_PROVIDER ?? 'mock';

  if (selected === 'claude' && process.env.ANTHROPIC_API_KEY) {
    return new ClaudeProvider();
  }

  return new MockProvider();
}
