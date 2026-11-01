import { describe, it, expect } from 'vitest';
import { parseEnv } from '../env';

describe('Environment Variable Handling (src/lib/env.ts)', () => {
  it('parses valid environment with sensible defaults', () => {
    const parsed = parseEnv({
      NODE_ENV: 'development',
      PORT: '3000',
    });

    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.PORT).toBe(3000);
    expect(parsed.LLM_PROVIDER).toBe('auto');
    expect(parsed.GEMINI_MODEL).toBe('gemini-2.5-flash');
    expect(parsed.ANTHROPIC_MODEL).toBe('claude-sonnet-5-5');
    expect(parsed.ALLOW_DEMO_MODE).toBe(false);
    expect(parsed.SESSION_SECRET).toBe('utsava-dev-session-secret-must-be-at-least-32-chars-long');
  });

  it('fails fast with detailed error when invalid NODE_ENV is provided', () => {
    expect(() => {
      parseEnv({
        NODE_ENV: 'staging' as unknown as 'development',
      });
    }).toThrowError(/Environment validation failed/);
  });

  it('coerces string port numbers to integer', () => {
    const parsed = parseEnv({
      PORT: '8080',
    });
    expect(parsed.PORT).toBe(8080);
  });

  it('parses ALLOW_DEMO_MODE from string flags', () => {
    const parsedTrue = parseEnv({ ALLOW_DEMO_MODE: 'true' });
    expect(parsedTrue.ALLOW_DEMO_MODE).toBe(true);

    const parsedFalse = parseEnv({ ALLOW_DEMO_MODE: 'false' });
    expect(parsedFalse.ALLOW_DEMO_MODE).toBe(false);
  });

  it('enforces SESSION_SECRET in production', () => {
    expect(() => {
      parseEnv({
        NODE_ENV: 'production',
      });
    }).toThrowError(/SESSION_SECRET must be explicitly provided/);

    expect(() => {
      parseEnv({
        NODE_ENV: 'production',
        SESSION_SECRET: 'too-short',
      });
    }).toThrowError(/Environment validation failed/);

    const valid = parseEnv({
      NODE_ENV: 'production',
      SESSION_SECRET: 'production-secret-must-be-at-least-32-chars-long',
    });
    expect(valid.SESSION_SECRET).toBe('production-secret-must-be-at-least-32-chars-long');
  });
});
