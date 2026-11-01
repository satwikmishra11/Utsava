import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { cleanJsonText, parseJsonWithSchema } from '../json';

describe('JSON Utilities (src/services/llm/json.ts)', () => {
  it('cleans markdown fenced code blocks with json identifier', () => {
    const raw = '```json\n{"hello": "world"}\n```';
    expect(cleanJsonText(raw)).toBe('{"hello": "world"}');
  });

  it('cleans code fences without language tag', () => {
    const raw = '```\n{"foo": 123}\n```';
    expect(cleanJsonText(raw)).toBe('{"foo": 123}');
  });

  it('extracts JSON when surrounded by conversational prefix and postfix', () => {
    const raw = 'Here is the data:\n```json\n{"status": "ok"}\n```\nHope that helps!';
    expect(cleanJsonText(raw)).toBe('{"status": "ok"}');
  });

  it('extracts JSON array when surrounded by text', () => {
    const raw = 'Result: [1, 2, 3] done.';
    expect(cleanJsonText(raw)).toBe('[1, 2, 3]');
  });

  it('returns untouched string if no json boundaries are detected', () => {
    const raw = 'Just a regular string';
    expect(cleanJsonText(raw)).toBe('Just a regular string');
  });

  it('successfully parses and validates schema', () => {
    const schema = z.object({ name: z.string(), count: z.number() });
    const raw = '```json\n{"name": "test", "count": 5}\n```';
    const parsed = parseJsonWithSchema(raw, schema);
    expect(parsed).toEqual({ name: 'test', count: 5 });
  });

  it('throws descriptive error on invalid JSON', () => {
    const schema = z.object({ name: z.string() });
    const raw = '```json\n{ invalid json }\n```';
    expect(() => parseJsonWithSchema(raw, schema)).toThrowError(/Failed to parse LLM JSON/);
  });

  it('throws validation error when schema does not match', () => {
    const schema = z.object({ name: z.string(), count: z.number() });
    const raw = '{"name": "test", "count": "not-a-number"}';
    expect(() => parseJsonWithSchema(raw, schema)).toThrow();
  });
});
