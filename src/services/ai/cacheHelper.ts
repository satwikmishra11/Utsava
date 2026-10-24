import { createHash } from 'node:crypto';

export function normalizeInput(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val.trim().toLowerCase();
  if (typeof val === 'number' || typeof val === 'boolean') return val;

  if (Array.isArray(val)) {
    const normalizedItems = val.map(normalizeInput);
    if (val.every((item) => typeof item === 'string')) {
      return [...(normalizedItems as string[])].sort();
    }
    return normalizedItems;
  }

  if (typeof val === 'object') {
    const sortedEntries = Object.entries(val as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, normalizeInput(v)]);
    return Object.fromEntries(sortedEntries);
  }

  return String(val);
}

export function createNormalizedHashKey(prefix: string, input: unknown): string {
  const normalized = normalizeInput(input);
  const serialized = JSON.stringify(normalized);
  const hash = createHash('sha256').update(serialized).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}
