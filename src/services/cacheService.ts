/**
 * Cache service for repeated AI generations with TTL support
 */

interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
}

export class GenerationCache {
  private readonly defaultTtlMs: number;
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(defaultTtlMs: number = 600000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  public get<T>(key: string, now: number = Date.now()): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  public set<T>(key: string, value: T, ttlMs?: number, now: number = Date.now()): void {
    const expiresAt = now + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiresAt });
  }

  public has(key: string, now: number = Date.now()): boolean {
    return this.get(key, now) !== null;
  }

  public clear(): void {
    this.cache.clear();
  }

  public static createHashKey(prefix: string, payload: Record<string, unknown>): string {
    const serialized = JSON.stringify(payload, Object.keys(payload).sort());
    return `${prefix}:${serialized}`;
  }
}

export const generationCache = new GenerationCache(600000); // 10 min TTL
