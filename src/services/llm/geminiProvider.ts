/**
 * Production Google Gemini provider powered by the official @google/genai SDK,
 * featuring automatic retry backoff, thinking minimization, and 20s request timeouts.
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { LLMProvider, LLMOptions } from './types';
import { parseJsonWithSchema } from './json';

/**
 * Custom error thrown on Gemini API failures, redacting sensitive tokens.
 */
export class GeminiProviderError extends Error {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'GeminiProviderError';
    this.originalError = originalError;
  }
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

function extractRetryDelay(err: unknown): number {
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    if (typeof errorObj.retryDelay === 'number') {
      return Math.min(Math.max(errorObj.retryDelay, 500), 3000);
    }
  }
  const msg = extractErrorMessage(err);
  const match = msg.match(/retry\s+in\s+(\d+(?:\.\d+)?)\s*s/i);
  if (match && match[1]) {
    const seconds = parseFloat(match[1]);
    return Math.min(Math.max(Math.round(seconds * 1000), 500), 3000);
  }
  return 1000;
}

function isRetryableStatus(err: unknown): boolean {
  if (typeof err === 'object' && err !== null) {
    const status = (err as Record<string, unknown>).status;
    if (status === 429 || status === 503) return true;
  }
  const msg = extractErrorMessage(err);
  return /429|503|RESOURCE_EXHAUSTED|UNAVAILABLE|rate limit/i.test(msg);
}

function sanitizeErrorMessage(msg: string, key?: string): string {
  if (!key) return msg;
  return msg.split(key).join('[REDACTED_API_KEY]');
}

async function withRetry<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  apiKey?: string
): Promise<T> {
  const signal1 = AbortSignal.timeout(20000);
  try {
    return await operation(signal1);
  } catch (err: unknown) {
    if (!isRetryableStatus(err)) {
      const msg = sanitizeErrorMessage(extractErrorMessage(err), apiKey);
      throw new GeminiProviderError(msg, err);
    }
    const delay = extractRetryDelay(err);
    await new Promise((res) => setTimeout(res, delay));
    const signal2 = AbortSignal.timeout(20000);
    try {
      return await operation(signal2);
    } catch (secondErr: unknown) {
      const msg = sanitizeErrorMessage(extractErrorMessage(secondErr), apiKey);
      throw new GeminiProviderError(msg, secondErr);
    }
  }
}

/**
 * Provider implementation connecting Utsava to Google Gemini models.
 */
export class GeminiProvider implements LLMProvider {
  public readonly name = 'gemini';
  private readonly client: GoogleGenAI;
  public readonly model: string;
  private readonly apiKey?: string;

  constructor(apiKey?: string, model = 'gemini-2.5-flash', injectedClient?: GoogleGenAI) {
    const key = apiKey ?? process.env.GEMINI_API_KEY;
    if (!key && !injectedClient) {
      throw new Error('GeminiProvider requires GEMINI_API_KEY');
    }
    this.apiKey = key;
    this.model = model;
    this.client =
      injectedClient ?? new GoogleGenAI({ apiKey: key, httpOptions: { timeout: 20000 } });
  }

  /**
   * Generates text completion using Gemini.
   */
  public async generateText(
    prompt: string,
    options?: LLMOptions,
    responseMimeType?: string
  ): Promise<string> {
    const maxTokens = Math.min(options?.maxTokens ?? 1024, 4096);
    const response = await withRetry((signal) => {
      return this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          temperature: options?.temperature,
          maxOutputTokens: maxTokens,
          systemInstruction: options?.systemPrompt,
          responseMimeType,
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: signal,
        },
      });
    }, this.apiKey);

    return response.text ?? '';
  }

  /**
   * Streams text tokens from Gemini.
   */
  public async streamText(prompt: string, options?: LLMOptions): Promise<ReadableStream<string>> {
    const maxTokens = Math.min(options?.maxTokens ?? 1024, 4096);
    const stream = await withRetry((signal) => {
      return this.client.models.generateContentStream({
        model: this.model,
        contents: prompt,
        config: {
          temperature: options?.temperature,
          maxOutputTokens: maxTokens,
          systemInstruction: options?.systemPrompt,
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: signal,
        },
      });
    }, this.apiKey);

    return new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              controller.enqueue(chunk.text);
            }
          }
          controller.close();
        } catch (err: unknown) {
          controller.error(err);
        }
      },
    });
  }

  /**
   * Extracts schema-validated JSON structures from Gemini.
   */
  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options?: LLMOptions
  ): Promise<T> {
    const raw = await this.generateText(prompt, options, 'application/json');
    return parseJsonWithSchema(raw, schema);
  }
}
