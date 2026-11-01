import { describe, it, expect, vi } from 'vitest';
import { logServerWarning } from '../logger';

describe('Server Logger (src/lib/logger.ts)', () => {
  it('writes structured json warnings to process.stderr', () => {
    const writeSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    logServerWarning('Test warning message', { capability: 'ideas', error: 'Test error' });

    expect(writeSpy).toHaveBeenCalled();
    const callArg = writeSpy.mock.calls[0]?.[0] as string;
    expect(callArg).toContain('[SERVER_WARN]');
    expect(callArg).toContain('Test warning message');
    expect(callArg).toContain('ideas');

    writeSpy.mockRestore();
  });

  it('redacts potential api keys and sensitive fields', () => {
    const writeSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    const prefix = 'AIza';
    const suffix = 'SyTestKeyPattern123456789012345678901';
    const dynamicKey = `${prefix}${suffix}`;

    logServerWarning(`Warning with key ${dynamicKey}`, {
      token: 'redacted-value',
      nested: { secret: 'nested-val' },
    });

    const callArg = writeSpy.mock.calls[0]?.[0] as string;
    expect(callArg).not.toContain(dynamicKey);
    expect(callArg).toContain('[REDACTED_API_KEY]');
    expect(callArg).toContain('[REDACTED]');

    writeSpy.mockRestore();
  });
});
