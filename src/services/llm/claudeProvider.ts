/**
 * Production Anthropic Claude provider handling streaming chat generation and
 * JSON structured extraction with temperature and token controls.
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { LLMProvider, LLMOptions } from './types';
import { parseJsonWithSchema } from './json';

/**
 * Provider implementation connecting Utsava to Anthropic Claude models.
 */
export class ClaudeProvider implements LLMProvider {
  public readonly name = 'claude';
  private readonly client: Anthropic;
  public readonly model: string;

  constructor(
    apiKey?: string,
    model: string = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5',
    injectedClient?: Anthropic
  ) {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key && !injectedClient) {
      throw new Error('ClaudeProvider requires ANTHROPIC_API_KEY');
    }
    this.client = injectedClient ?? new Anthropic({ apiKey: key, timeout: 20000 });
    this.model = model;
  }

  /**
   * Generates text completion using Anthropic Claude.
   */
  public async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    const maxTokens = Math.min(options?.maxTokens ?? 1024, 4096);
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: maxTokens,
        system: options?.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: AbortSignal.timeout(20000) }
    );

    const block = response.content[0];
    return block && block.type === 'text' ? block.text : '';
  }

  /**
   * Streams text tokens from Anthropic Claude.
   */
  public async streamText(prompt: string, options?: LLMOptions): Promise<ReadableStream<string>> {
    const maxTokens = Math.min(options?.maxTokens ?? 1024, 4096);
    const stream = this.client.messages.stream(
      {
        model: this.model,
        max_tokens: maxTokens,
        system: options?.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: AbortSignal.timeout(20000) }
    );

    return new ReadableStream<string>({
      async start(controller) {
        stream.on('text', (delta) => controller.enqueue(delta));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });
  }

  /**
   * Extracts schema-validated JSON structures from Anthropic Claude.
   */
  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options?: LLMOptions
  ): Promise<T> {
    const system = `${options?.systemPrompt ?? ''}\nReturn ONLY valid JSON matching the required schema. No markdown formatting, no backticks.`;
    const text = await this.generateText(prompt, { ...options, systemPrompt: system });
    return parseJsonWithSchema(text, schema);
  }
}
