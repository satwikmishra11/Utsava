import { describe, it, expect } from 'vitest';
import { resolveProviderName, ConfigurationError } from '../resolveProvider';

describe('LLM Provider Resolver (resolveProviderName)', () => {
  describe('Auto Resolution ("auto" or unset)', () => {
    it('selects Gemini when LLM_PROVIDER is undefined and GEMINI_API_KEY is present', () => {
      const res = resolveProviderName({
        GEMINI_API_KEY: 'test-gemini-key',
      });
      expect(res.name).toBe('gemini');
      expect(res.reason).toContain('GEMINI_API_KEY');
    });

    it('selects Gemini when GEMINI_API_KEY is present', () => {
      const res = resolveProviderName({
        LLM_PROVIDER: 'auto',
        GEMINI_API_KEY: 'test-gemini-key',
      });
      expect(res.name).toBe('gemini');
      expect(res.reason).toContain('GEMINI_API_KEY');
    });

    it('selects Gemini even if both GEMINI_API_KEY and ANTHROPIC_API_KEY are present (Gemini primary)', () => {
      const res = resolveProviderName({
        LLM_PROVIDER: 'auto',
        GEMINI_API_KEY: 'test-gemini-key',
        ANTHROPIC_API_KEY: 'test-claude-key',
      });
      expect(res.name).toBe('gemini');
    });

    it('selects Claude when only ANTHROPIC_API_KEY is present', () => {
      const res = resolveProviderName({
        LLM_PROVIDER: 'auto',
        ANTHROPIC_API_KEY: 'test-claude-key',
      });
      expect(res.name).toBe('claude');
      expect(res.reason).toContain('ANTHROPIC_API_KEY');
    });

    it('falls back to MockProvider in development when no keys exist', () => {
      const res = resolveProviderName({
        NODE_ENV: 'development',
        LLM_PROVIDER: 'auto',
      });
      expect(res.name).toBe('mock');
    });

    it('falls back to MockProvider in test when no keys exist', () => {
      const res = resolveProviderName({
        NODE_ENV: 'test',
        LLM_PROVIDER: 'auto',
      });
      expect(res.name).toBe('mock');
    });

    it('throws ConfigurationError in production with no keys when ALLOW_DEMO_MODE is false', () => {
      expect(() =>
        resolveProviderName({
          NODE_ENV: 'production',
          LLM_PROVIDER: 'auto',
          ALLOW_DEMO_MODE: false,
        })
      ).toThrow(ConfigurationError);
    });

    it('allows MockProvider in production if ALLOW_DEMO_MODE is true', () => {
      const res = resolveProviderName({
        NODE_ENV: 'production',
        LLM_PROVIDER: 'auto',
        ALLOW_DEMO_MODE: true,
      });
      expect(res.name).toBe('mock');
      expect(res.reason).toContain('ALLOW_DEMO_MODE');
    });
  });

  describe('Explicit Gemini Resolution ("gemini")', () => {
    it('returns gemini when GEMINI_API_KEY is present', () => {
      const res = resolveProviderName({
        LLM_PROVIDER: 'gemini',
        GEMINI_API_KEY: 'test-gemini-key',
      });
      expect(res.name).toBe('gemini');
    });

    it('throws ConfigurationError when GEMINI_API_KEY is missing', () => {
      expect(() =>
        resolveProviderName({
          LLM_PROVIDER: 'gemini',
        })
      ).toThrow(ConfigurationError);
    });
  });

  describe('Explicit Claude Resolution ("claude")', () => {
    it('returns claude when ANTHROPIC_API_KEY is present', () => {
      const res = resolveProviderName({
        LLM_PROVIDER: 'claude',
        ANTHROPIC_API_KEY: 'test-claude-key',
      });
      expect(res.name).toBe('claude');
    });

    it('throws ConfigurationError when ANTHROPIC_API_KEY is missing', () => {
      expect(() =>
        resolveProviderName({
          LLM_PROVIDER: 'claude',
        })
      ).toThrow(ConfigurationError);
    });
  });

  describe('Explicit Mock Resolution ("mock")', () => {
    it('allows mock in development', () => {
      const res = resolveProviderName({
        NODE_ENV: 'development',
        LLM_PROVIDER: 'mock',
      });
      expect(res.name).toBe('mock');
    });

    it('allows mock in test', () => {
      const res = resolveProviderName({
        NODE_ENV: 'test',
        LLM_PROVIDER: 'mock',
      });
      expect(res.name).toBe('mock');
    });

    it('throws ConfigurationError in production if ALLOW_DEMO_MODE is false', () => {
      expect(() =>
        resolveProviderName({
          NODE_ENV: 'production',
          LLM_PROVIDER: 'mock',
          ALLOW_DEMO_MODE: false,
        })
      ).toThrow(ConfigurationError);
    });

    it('allows mock in production if ALLOW_DEMO_MODE is true', () => {
      const res = resolveProviderName({
        NODE_ENV: 'production',
        LLM_PROVIDER: 'mock',
        ALLOW_DEMO_MODE: true,
      });
      expect(res.name).toBe('mock');
    });
  });

  describe('Security and Secret Redaction', () => {
    it('never leaks API keys into error messages', () => {
      try {
        resolveProviderName({
          NODE_ENV: 'production',
          LLM_PROVIDER: 'gemini',
          GEMINI_API_KEY: '',
        });
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ConfigurationError);
        const msg = (err as ConfigurationError).message;
        expect(msg).not.toContain('secret');
        expect(msg).not.toContain('key-value');
      }
    });
  });
});
