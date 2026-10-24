import { z } from 'zod';
import { LLMProvider, LLMOptions } from './types';

export class MockProvider implements LLMProvider {
  public readonly name = 'mock';
  private readonly defaultResponse: string;

  constructor(defaultResponse: string = 'This is a deterministic response from MockProvider.') {
    this.defaultResponse = defaultResponse;
  }

  public async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    if (options?.systemPrompt?.includes('JSON')) {
      return JSON.stringify({ message: 'mocked structured response', prompt });
    }
    return `[Mock:${this.name}] Response to: ${prompt.slice(0, 30)}...`;
  }

  public async streamText(prompt: string, _options?: LLMOptions): Promise<ReadableStream<string>> {
    const text = this.defaultResponse || prompt;
    const words = text.split(' ');

    return new ReadableStream<string>({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(`${word} `);
          await new Promise((r) => setTimeout(r, 5));
        }
        controller.close();
      },
    });
  }

  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    _options?: LLMOptions
  ): Promise<T> {
    // If prompt is for ideas
    if (prompt.includes('ideas') || prompt.includes('theme')) {
      const sample = [
        {
          id: 'mock-1',
          category: 'theme',
          title: 'Mock Heritage Theme',
          description: 'A mock cultural installation for tests.',
          estimatedCostTier: 'medium',
          tags: ['mock', 'decor'],
        },
      ];
      return schema.parse(sample);
    }
    throw new Error('MockProvider: unsupported structured prompt pattern for mock');
  }
}
