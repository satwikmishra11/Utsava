import { z } from 'zod';
import { LLMProvider, LLMOptions } from './types';

function buildChatMockPayload(): unknown {
  return {
    reply: 'I can assist you with that! I will adjust the catering budget accordingly.',
    toolCalls: [
      {
        tool: 'update_budget_item',
        parameters: { category: 'catering', estimated: 3200, notes: 'Adjusted per chat' },
      },
    ],
  };
}

function buildBudgetMockPayload(): unknown {
  return {
    items: [
      { category: 'venue', estimated: 4000, notes: 'Grand hall reservation' },
      { category: 'catering', estimated: 3000, notes: 'Chef-curated menu' },
      { category: 'photography', estimated: 1500, notes: 'Full-day coverage' },
    ],
    totalAllocated: 8500,
    currency: 'INR',
  };
}

function buildTimelineMockPayload(): unknown {
  return {
    tasks: [
      { id: 't-1', title: 'Reserve Venue', category: 'venue', daysBeforeEvent: 120, dependsOn: [] },
      {
        id: 't-2',
        title: 'Book Caterer',
        category: 'catering',
        daysBeforeEvent: 60,
        dependsOn: ['t-1'],
      },
    ],
  };
}

function buildVendorMockPayload(): unknown {
  return {
    vendors: [
      {
        category: 'venue',
        name: 'The Grand Pavilion',
        role: 'Banquet Venue',
        deliverables: ['Hall access', 'Valet'],
        estimatedQuote: 4500,
        recommendedLeadWeeks: 20,
        priority: 'critical',
        status: 'shortlisted',
      },
    ],
  };
}

function buildIdeasMockPayload(): unknown {
  return {
    ideas: [
      {
        id: 'mock-1',
        category: 'theme',
        title: 'Mock Heritage Theme',
        description: 'A mock cultural installation for tests.',
        estimatedCostTier: 'medium',
        culturalContext: 'South Asian',
        tags: ['mock', 'decor'],
      },
    ],
  };
}

function buildMockPayload(prompt: string): unknown {
  const p = prompt.toLowerCase();
  if (p.includes('toolcalls') || p.includes('user_message') || p.includes('shortlist_vendor')) {
    return buildChatMockPayload();
  }
  if (p.includes('budget') || p.includes('allocated')) {
    return buildBudgetMockPayload();
  }
  if (p.includes('timeline') || p.includes('daysbeforeevent')) {
    return buildTimelineMockPayload();
  }
  if (p.includes('vendor') || p.includes('checklist')) {
    return buildVendorMockPayload();
  }
  return buildIdeasMockPayload();
}

export class MockProvider implements LLMProvider {
  public readonly name = 'mock';
  private readonly defaultResponse: string;
  private failureCount: number = 0;
  private customStructuredHandler?: (prompt: string) => unknown;

  constructor(defaultResponse: string = 'This is a deterministic response from MockProvider.') {
    this.defaultResponse = defaultResponse;
  }

  public setFailureCount(count: number): void {
    this.failureCount = count;
  }

  public setCustomStructuredHandler(handler: (prompt: string) => unknown): void {
    this.customStructuredHandler = handler;
  }

  public async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    if (this.failureCount > 0) {
      this.failureCount--;
      throw new Error('Simulated MockProvider failure');
    }
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
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    _options?: LLMOptions
  ): Promise<T> {
    if (this.failureCount > 0) {
      this.failureCount--;
      throw new Error('Simulated MockProvider generateStructured failure');
    }
    if (this.customStructuredHandler) {
      return schema.parse(this.customStructuredHandler(prompt));
    }
    const payload = buildMockPayload(prompt);
    const parsed = schema.safeParse(payload);
    if (parsed.success) return parsed.data;

    // Backward-compatibility: if schema directly expects array of ideas
    if (Array.isArray(payload) || (payload && typeof payload === 'object' && 'ideas' in payload)) {
      const ideasArray = (payload as { ideas: unknown[] }).ideas ?? payload;
      const arrayParsed = schema.safeParse(ideasArray);
      if (arrayParsed.success) return arrayParsed.data;
    }

    return schema.parse(payload);
  }
}
