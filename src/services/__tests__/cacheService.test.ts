import { describe, it, expect, beforeEach } from 'vitest';
import { GenerationCache } from '../cacheService';

describe('GenerationCache Service', () => {
  let cache: GenerationCache;

  beforeEach(() => {
    cache = new GenerationCache(5000); // 5 sec default TTL
  });

  it('stores and retrieves cached data', () => {
    cache.set('key-1', { ideas: ['Theme A', 'Theme B'] }, 5000, 1000);
    const retrieved = cache.get<{ ideas: string[] }>('key-1', 2000);
    expect(retrieved?.ideas).toHaveLength(2);
  });

  it('expires entries past their TTL', () => {
    cache.set('key-1', 'value', 1000, 1000); // expires at 2000
    expect(cache.get('key-1', 1500)).toBe('value');
    expect(cache.get('key-1', 2500)).toBeNull();
  });

  it('generates consistent deterministic hash keys', () => {
    const key1 = GenerationCache.createHashKey('ideas', { type: 'wedding', budget: 10000 });
    const key2 = GenerationCache.createHashKey('ideas', { budget: 10000, type: 'wedding' });
    expect(key1).toBe(key2);
  });
});
