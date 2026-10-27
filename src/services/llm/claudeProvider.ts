/**
 * Production Anthropic Claude provider handling streaming chat generation and
 * JSON structured extraction with temperature and token controls.
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import { LLMProvider, LLMOptions } from './types';

export class ClaudeProvider implements LLMProvider {
  public readonly name = 'claude';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey?: string, model: string = 'claude-3-5-sonnet-20241022') {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('ClaudeProvider requires ANTHROPIC_API_KEY');
    }
    this.client = new Anthropic({ apiKey: key });
    this.model = model;
  }

  public async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 1024,
      system: options?.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = response.content[0];
    return block && block.type === 'text' ? block.text : '';
  }

  public async streamText(prompt: string, options?: LLMOptions): Promise<ReadableStream<string>> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: options?.maxTokens ?? 1024,
      system: options?.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    return new ReadableStream<string>({
      async start(controller) {
        stream.on('text', (delta) => controller.enqueue(delta));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });
  }

  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options?: LLMOptions
  ): Promise<T> {
    const system = `${options?.systemPrompt ?? ''}\nReturn ONLY valid JSON matching the required schema. No markdown formatting, no backticks.`;
    const text = await this.generateText(prompt, { ...options, systemPrompt: system });
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    return schema.parse(JSON.parse(cleanJson));
  }
}
