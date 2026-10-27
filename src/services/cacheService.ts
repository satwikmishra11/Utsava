/**
 * Cache service for repeated AI generations with TTL support and input invalidation
 */

interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
}

export interface CacheStats {
  readonly size: number;
  readonly hits: number;
  readonly misses: number;
}

export class GenerationCache {
  private readonly defaultTtlMs: number;
  private readonly maxCapacity: number;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private hitsCount = 0;
  private missesCount = 0;

  constructor(defaultTtlMs: number = 600000, maxCapacity: number = 500) {
    this.defaultTtlMs = defaultTtlMs;
    this.maxCapacity = maxCapacity;
  }

  public get<T>(key: string, now: number = Date.now()): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.missesCount++;
      return null;
    }
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.missesCount++;
      return null;
    }
    this.hitsCount++;
    return entry.value;
  }

  public set<T>(key: string, value: T, ttlMs?: number, now: number = Date.now()): void {
    if (this.cache.size >= this.maxCapacity && !this.cache.has(key)) {
      this.evictExpiredOrOldest(now);
    }
    const expiresAt = now + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiresAt });
  }

  private evictExpiredOrOldest(now: number): void {
    for (const [k, v] of this.cache.entries()) {
      if (now > v.expiresAt) {
        this.cache.delete(k);
        return;
      }
    }
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) this.cache.delete(oldestKey);
  }

  public has(key: string, now: number = Date.now()): boolean {
    return this.get(key, now) !== null;
  }

  public invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  public invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  public clear(): void {
    this.cache.clear();
    this.hitsCount = 0;
    this.missesCount = 0;
  }

  public getStats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.hitsCount,
      misses: this.missesCount,
    };
  }

  public static createHashKey(prefix: string, payload: Record<string, unknown>): string {
    const serialized = JSON.stringify(payload, Object.keys(payload).sort());
    return `${prefix}:${serialized}`;
  }
}

export function createGenerationCache(
  defaultTtlMs: number = 600000,
  maxCapacity: number = 500
): GenerationCache {
  return new GenerationCache(defaultTtlMs, maxCapacity);
}

export const generationCache = createGenerationCache(600000); // 10 min TTL
