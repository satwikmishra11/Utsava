/**
 * Utilities for cleaning, extracting, and validating structured JSON from LLM outputs.
 */

import { z } from 'zod';

function findJsonBoundaries(text: string): { start: number; end: number } | null {
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let start = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
  }

  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);

  if (start !== -1 && end !== -1 && end >= start) {
    return { start, end: end + 1 };
  }
  return null;
}

/**
 * Strips markdown code blocks and extracts raw JSON from an LLM response string.
 *
 * @param raw - Raw text from language model completion.
 * @returns Cleaned JSON substring ready for parsing.
 */
export function cleanJsonText(raw: string): string {
  let cleaned = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
  const boundaries = findJsonBoundaries(cleaned);
  if (boundaries) {
    cleaned = cleaned.slice(boundaries.start, boundaries.end).trim();
  }
  return cleaned;
}

/**
 * Parses cleaned JSON text and validates against a provided Zod schema.
 *
 * @param raw - Raw text received from language model.
 * @param schema - Zod validation schema.
 * @returns Fully validated and typed object matching schema.
 * @throws {Error} When JSON parsing or schema validation fails.
 */
export function parseJsonWithSchema<T>(
  raw: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
): T {
  const cleaned = cleanJsonText(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to parse LLM JSON response: ${errorMsg}\nRaw snippet: ${raw.slice(0, 100)}`
    );
  }

  return schema.parse(parsed);
}
