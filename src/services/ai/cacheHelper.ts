function hashString(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

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
  const hash = hashString(serialized);
  return `${prefix}:${hash}`;
}
