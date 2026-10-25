import { describe, it, expect } from 'vitest';
import { isCsrfSafeMethod, validateCsrf } from '../csrf';

describe('CSRF Protection', () => {
  it('identifies safe HTTP methods', () => {
    expect(isCsrfSafeMethod('GET')).toBe(true);
    expect(isCsrfSafeMethod('get')).toBe(true);
    expect(isCsrfSafeMethod('HEAD')).toBe(true);
    expect(isCsrfSafeMethod('OPTIONS')).toBe(true);
    expect(isCsrfSafeMethod('POST')).toBe(false);
    expect(isCsrfSafeMethod('PUT')).toBe(false);
    expect(isCsrfSafeMethod('DELETE')).toBe(false);
    expect(isCsrfSafeMethod('PATCH')).toBe(false);
  });

  it('allows safe methods unconditionally', () => {
    const req = new Request('http://localhost:3000/api/events', { method: 'GET' });
    expect(validateCsrf(req)).toBe(true);
  });

  it('allows state-changing requests with custom headers', () => {
    const reqWithRequestedWith = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'x-requested-with': 'XMLHttpRequest' },
    });
    expect(validateCsrf(reqWithRequestedWith)).toBe(true);

    const reqWithCsrfToken = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'x-csrf-token': 'custom-token-xyz' },
    });
    expect(validateCsrf(reqWithCsrfToken)).toBe(true);
  });

  it('allows requests when Origin matches Host or x-forwarded-host', () => {
    const validReq = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
      },
    });
    expect(validateCsrf(validReq)).toBe(true);

    const forwardedReq = new Request('http://example.com/api/events', {
      method: 'POST',
      headers: {
        'x-forwarded-host': 'utsava.app',
        origin: 'https://utsava.app',
      },
    });
    expect(validateCsrf(forwardedReq)).toBe(true);
  });

  it('rejects requests when Origin does not match Host', () => {
    const maliciousReq = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        origin: 'https://evil-attacker.com',
      },
    });
    expect(validateCsrf(maliciousReq)).toBe(false);
  });

  it('allows requests when Referer matches Host and Origin is absent', () => {
    const validRefererReq = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        referer: 'http://localhost:3000/events/create',
      },
    });
    expect(validateCsrf(validRefererReq)).toBe(true);
  });

  it('rejects requests when Referer does not match Host', () => {
    const badRefererReq = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        referer: 'http://malicious.com/phishing',
      },
    });
    expect(validateCsrf(badRefererReq)).toBe(false);
  });

  it('handles malformed Origin or Referer URLs gracefully', () => {
    const malformedOrigin = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        origin: 'not-a-valid-url',
      },
    });
    expect(validateCsrf(malformedOrigin)).toBe(false);

    const malformedReferer = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        referer: ':::broken-url',
      },
    });
    expect(validateCsrf(malformedReferer)).toBe(false);
  });

  it('allows API requests with Authorization header when Origin/Referer are absent', () => {
    const apiReq = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        authorization: 'Bearer token-123',
      },
    });
    expect(validateCsrf(apiReq)).toBe(true);
  });

  it('rejects state-changing requests missing host and all verification signals', () => {
    const blankReq = new Request('http://localhost:3000/api/events', {
      method: 'POST',
    });
    expect(validateCsrf(blankReq)).toBe(false);
  });
});
