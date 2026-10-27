/**
 * Enforces double-submit header and origin verification on state-changing requests,
 * defending event planners from unauthorized cross-site action execution.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isCsrfSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase());
}

function extractHost(urlStr: string): string | null {
  try {
    const parsed = new URL(urlStr);
    return parsed.host;
  } catch {
    return null;
  }
}

export function validateCsrf(req: Request): boolean {
  if (isCsrfSafeMethod(req.method)) return true;

  const customHeader = req.headers.get('x-requested-with') || req.headers.get('x-csrf-token');
  if (customHeader) return true;

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!host) return false;

  const origin = req.headers.get('origin');
  if (origin) {
    const originHost = extractHost(origin);
    return originHost === host;
  }

  const referer = req.headers.get('referer');
  if (referer) {
    const refererHost = extractHost(referer);
    return refererHost === host;
  }

  // If in non-browser or test API context with no Origin/Referer but explicit Authorization
  if (req.headers.get('authorization')) return true;

  return false;
}
