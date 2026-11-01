/**
 * Deterministic LLM provider resolution module mapping environment configurations
 * to concrete providers and strictly enforcing credential requirements.
 */

export type ResolvedProviderName = 'gemini' | 'claude' | 'mock';

export interface ProviderResolution {
  readonly name: ResolvedProviderName;
  readonly reason: string;
}

export interface ResolverEnv {
  readonly NODE_ENV?: 'development' | 'test' | 'production';
  readonly LLM_PROVIDER?: 'auto' | 'gemini' | 'claude' | 'mock';
  readonly GEMINI_API_KEY?: string;
  readonly ANTHROPIC_API_KEY?: string;
  readonly ALLOW_DEMO_MODE?: boolean;
}

/**
 * Exception raised when the configured LLM provider lacks mandatory credentials
 * or violates deployment safety constraints.
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

function resolveExplicit(
  provider: 'gemini' | 'claude' | 'mock',
  env: ResolverEnv,
  isProd: boolean,
  allowDemo: boolean
): ProviderResolution {
  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) {
      throw new ConfigurationError(
        'LLM_PROVIDER is set to "gemini" but GEMINI_API_KEY is not configured.'
      );
    }
    return { name: 'gemini', reason: 'Explicitly configured for Gemini with GEMINI_API_KEY.' };
  }

  if (provider === 'claude') {
    if (!env.ANTHROPIC_API_KEY) {
      throw new ConfigurationError(
        'LLM_PROVIDER is set to "claude" but ANTHROPIC_API_KEY is not configured.'
      );
    }
    return { name: 'claude', reason: 'Explicitly configured for Claude with ANTHROPIC_API_KEY.' };
  }

  if (isProd && !allowDemo) {
    throw new ConfigurationError(
      'LLM_PROVIDER is set to "mock" in production, but ALLOW_DEMO_MODE is false.'
    );
  }
  return { name: 'mock', reason: 'Explicitly configured for MockProvider.' };
}

function resolveAuto(env: ResolverEnv, isProd: boolean, allowDemo: boolean): ProviderResolution {
  if (env.GEMINI_API_KEY) {
    return {
      name: 'gemini',
      reason: 'Auto-detected GEMINI_API_KEY; selected Gemini as primary provider.',
    };
  }

  if (env.ANTHROPIC_API_KEY) {
    return {
      name: 'claude',
      reason: 'Auto-detected ANTHROPIC_API_KEY; selected Claude as secondary provider.',
    };
  }

  if (!isProd || allowDemo) {
    const reason = allowDemo
      ? 'No API keys detected; falling back to MockProvider because ALLOW_DEMO_MODE is true.'
      : 'No API keys detected; falling back to MockProvider in non-production mode.';
    return { name: 'mock', reason };
  }

  throw new ConfigurationError(
    'No valid LLM credentials found (GEMINI_API_KEY or ANTHROPIC_API_KEY required in production).'
  );
}

/**
 * Resolves which LLM provider to instantiate based on environment configuration.
 *
 * @param env - Application environment configuration object.
 * @returns Chosen provider name and the rationale behind selection.
 * @throws {ConfigurationError} When credentials are missing or demo constraints are violated.
 */
export function resolveProviderName(env: ResolverEnv): ProviderResolution {
  const provider = env.LLM_PROVIDER ?? 'auto';
  const isProd = env.NODE_ENV === 'production';
  const allowDemo = Boolean(env.ALLOW_DEMO_MODE);

  if (provider !== 'auto') {
    return resolveExplicit(provider, env, isProd, allowDemo);
  }

  return resolveAuto(env, isProd, allowDemo);
}
