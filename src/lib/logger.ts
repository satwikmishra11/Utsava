/**
 * Structured server-side logging utilities adhering to zero-console architectural constraints.
 */

function sanitizeLogValue(val: unknown): unknown {
  if (typeof val === 'string') {
    return val
      .replace(/sk-ant-[a-zA-Z0-9_-]+/gi, '[REDACTED_API_KEY]')
      .replace(/AIza[0-9A-Za-z\-_]+/gi, '[REDACTED_API_KEY]');
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeLogValue);
  }
  if (typeof val === 'object' && val !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      sanitized[k] = /key|secret|token|password|auth/i.test(k) ? '[REDACTED]' : sanitizeLogValue(v);
    }
    return sanitized;
  }
  return val;
}

/**
 * Emits a structured server-side warning to stderr without invoking forbidden console methods.
 *
 * @param message - Warning description.
 * @param details - Optional contextual metadata.
 */
export function logServerWarning(message: string, details?: Record<string, unknown>): void {
  const sanitizedMessage = String(sanitizeLogValue(message));
  const sanitizedDetails = details
    ? (sanitizeLogValue(details) as Record<string, unknown>)
    : undefined;

  const payload = {
    level: 'warn',
    timestamp: new Date().toISOString(),
    message: sanitizedMessage,
    ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
  };

  process.stderr.write(`[SERVER_WARN] ${JSON.stringify(payload)}\n`);
}
