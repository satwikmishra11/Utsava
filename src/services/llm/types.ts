import { z } from 'zod';

export interface LLMMessage {
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
}

export interface LLMOptions {
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly systemPrompt?: string;
  readonly history?: readonly LLMMessage[];
}

export interface LLMProvider {
  readonly name: string;
  generateText(prompt: string, options?: LLMOptions): Promise<string>;
  streamText(prompt: string, options?: LLMOptions): Promise<ReadableStream<string>>;
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options?: LLMOptions
  ): Promise<T>;
}
