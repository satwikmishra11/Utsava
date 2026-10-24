import { describe, it, expect } from 'vitest';
import { normalizeInput, createNormalizedHashKey } from '../cacheHelper';

describe('AI Cache Normalization & Hashing', () => {
  it('normalizes string casing and whitespace', () => {
    expect(normalizeInput('  Wedding ')).toBe('wedding');
  });

  it('sorts string arrays deterministically', () => {
    const arr1 = ['Vegetarian', 'Nut-Free', 'Halal'];
    const arr2 = ['Halal', 'Vegetarian', 'Nut-Free'];
    expect(normalizeInput(arr1)).toEqual(['halal', 'nut-free', 'vegetarian']);
    expect(normalizeInput(arr1)).toEqual(normalizeInput(arr2));
  });

  it('sorts object keys regardless of original insertion order', () => {
    const obj1 = { eventType: 'wedding', guestCount: 150, culture: 'Desi' };
    const obj2 = { culture: 'desi', guestCount: 150, eventType: 'wedding' };
    expect(normalizeInput(obj1)).toEqual(normalizeInput(obj2));
  });

  it('generates identical hash keys for semantically identical inputs', () => {
    const key1 = createNormalizedHashKey('budget', {
      eventType: 'wedding',
      guestCount: 200,
      dietary: ['Gluten-Free', 'Vegan'],
    });
    const key2 = createNormalizedHashKey('budget', {
      dietary: ['vegan', 'gluten-free'],
      guestCount: 200,
      eventType: 'wedding',
    });
    expect(key1).toBe(key2);
  });

  it('generates distinct hash keys when inputs differ', () => {
    const key1 = createNormalizedHashKey('budget', { eventType: 'wedding', guestCount: 100 });
    const key2 = createNormalizedHashKey('budget', { eventType: 'wedding', guestCount: 200 });
    expect(key1).not.toBe(key2);
  });
});
