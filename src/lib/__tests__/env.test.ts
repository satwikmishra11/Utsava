import { describe, it, expect } from 'vitest';
import { parseEnv } from '../env';

describe('Environment Variable Handling (src/lib/env.ts)', () => {
  it('parses valid environment with sensible defaults', () => {
    const parsed = parseEnv({
      NODE_ENV: 'development',
      PORT: '3000',
      LLM_PROVIDER: 'mock',
    });

    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.PORT).toBe(3000);
    expect(parsed.LLM_PROVIDER).toBe('mock');
  });

  it('fails fast with detailed error when invalid NODE_ENV is provided', () => {
    expect(() => {
      parseEnv({
        NODE_ENV: 'staging' as any,
      });
    }).toThrowError(/Environment validation failed/);
  });

  it('coerces string port numbers to integer', () => {
    const parsed = parseEnv({
      PORT: '8080',
    });
    expect(parsed.PORT).toBe(8080);
  });
});
