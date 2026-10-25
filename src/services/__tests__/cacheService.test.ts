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
    expect(cache.has('key-1', 2000)).toBe(true);
  });

  it('uses default TTL when not explicitly provided', () => {
    cache.set('key-default', 'value', undefined, 1000);
    expect(cache.get('key-default', 5999)).toBe('value');
    expect(cache.get('key-default', 6001)).toBeNull();
  });

  it('expires entries past their TTL and removes them', () => {
    cache.set('key-1', 'value', 1000, 1000); // expires at 2000
    expect(cache.get('key-1', 1500)).toBe('value');
    expect(cache.get('key-1', 2500)).toBeNull();
    expect(cache.has('key-1', 2500)).toBe(false);
  });

  it('returns null on cache misses', () => {
    expect(cache.get('non-existent-key')).toBeNull();
    expect(cache.has('non-existent-key')).toBe(false);
  });

  it('invalidates single keys', () => {
    cache.set('key-1', 'val-1');
    expect(cache.invalidate('key-1')).toBe(true);
    expect(cache.get('key-1')).toBeNull();
    expect(cache.invalidate('key-1')).toBe(false);
  });

  it('invalidates keys matching a prefix', () => {
    cache.set('event:123:budget', { amount: 1000 });
    cache.set('event:123:timeline', { count: 5 });
    cache.set('event:456:budget', { amount: 2000 });

    const deleted = cache.invalidatePrefix('event:123:');
    expect(deleted).toBe(2);
    expect(cache.get('event:123:budget')).toBeNull();
    expect(cache.get('event:123:timeline')).toBeNull();
    expect(cache.get('event:456:budget')).toBeDefined();
  });

  it('clears all entries and resets stats', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.get('non-existent');

    cache.clear();
    const stats = cache.getStats();
    expect(stats.size).toBe(0);
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
  });

  it('tracks accurate hit and miss metrics', () => {
    cache.set('hit-me', 'yes');
    cache.get('hit-me'); // hit 1
    cache.get('hit-me'); // hit 2
    cache.get('miss-me'); // miss 1

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.size).toBe(1);
  });

  it('generates consistent deterministic hash keys regardless of property ordering', () => {
    const key1 = GenerationCache.createHashKey('ideas', {
      type: 'wedding',
      budget: 10000,
      culture: 'Modern',
    });
    const key2 = GenerationCache.createHashKey('ideas', {
      culture: 'Modern',
      type: 'wedding',
      budget: 10000,
    });
    expect(key1).toBe(key2);
    expect(key1).toBe('ideas:{"budget":10000,"culture":"Modern","type":"wedding"}');
  });
});
