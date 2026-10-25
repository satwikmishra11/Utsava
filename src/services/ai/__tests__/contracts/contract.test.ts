import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  GeneratedBudgetPlanSchema,
  GeneratedTimelineSchema,
  GeneratedVendorChecklistSchema,
  GeneratedIdeasSchema,
  ToolCallSchema,
} from '../../types';

function loadFixture<T>(filename: string): T {
  const filePath = path.join(__dirname, 'fixtures', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

describe('LLM Schema Contract Tests (Recorded Golden Fixtures)', () => {
  describe('GeneratedBudgetPlanSchema Contract', () => {
    it('validates golden budget plan fixture against schema', () => {
      const fixture = loadFixture('budgetPlan.fixture.json');
      const parsed = GeneratedBudgetPlanSchema.parse(fixture);

      expect(parsed.totalAllocated).toBe(45000);
      expect(parsed.currency).toBe('INR');
      expect(parsed.items.length).toBeGreaterThanOrEqual(5);

      const venueItem = parsed.items.find((i) => i.category === 'venue');
      expect(venueItem).toBeDefined();
      expect(venueItem?.estimated).toBe(15000);
    });

    it('rejects budget fixture when items have illegal categories or negative values', () => {
      const fixture = loadFixture<Record<string, unknown>>('budgetPlan.fixture.json');
      const brokenFixture = {
        ...fixture,
        items: [{ category: 'illegal_category_123', estimated: -500 }],
      };

      expect(() => GeneratedBudgetPlanSchema.parse(brokenFixture)).toThrowError();
    });
  });

  describe('GeneratedTimelineSchema Contract', () => {
    it('validates golden timeline fixture against schema', () => {
      const fixture = loadFixture('timeline.fixture.json');
      const parsed = GeneratedTimelineSchema.parse(fixture);

      expect(parsed.tasks.length).toBe(5);
      const leadTask = parsed.tasks.find((t) => t.id === 't-1');
      expect(leadTask?.daysBeforeEvent).toBe(180);
      expect(leadTask?.status).toBe('completed');
    });

    it('rejects timeline fixture when tasks lack required identifiers or categories', () => {
      const brokenFixture = {
        tasks: [{ title: 'Nameless Task without ID', daysBeforeEvent: -1 }],
      };

      expect(() => GeneratedTimelineSchema.parse(brokenFixture)).toThrowError();
    });
  });

  describe('GeneratedVendorChecklistSchema Contract', () => {
    it('validates golden vendor checklist fixture against schema', () => {
      const fixture = loadFixture('vendorChecklist.fixture.json');
      const parsed = GeneratedVendorChecklistSchema.parse(fixture);

      expect(parsed.vendors.length).toBe(3);
      const criticalVendor = parsed.vendors.find((v) => v.priority === 'critical');
      expect(criticalVendor).toBeDefined();
      expect(criticalVendor?.estimatedQuote).toBeGreaterThan(0);
      expect(criticalVendor?.recommendedLeadWeeks).toBeGreaterThan(0);
    });

    it('rejects vendor fixture when status or priority violates allowed enums', () => {
      const fixture = loadFixture<{ vendors: Record<string, unknown>[] }>(
        'vendorChecklist.fixture.json'
      );
      const brokenFixture = {
        vendors: [
          {
            ...fixture.vendors[0],
            priority: 'urgent_non_existent',
            status: 'unknown_status',
          },
        ],
      };

      expect(() => GeneratedVendorChecklistSchema.parse(brokenFixture)).toThrowError();
    });
  });

  describe('GeneratedIdeasSchema Contract', () => {
    it('validates golden ideas fixture against schema', () => {
      const fixture = loadFixture('ideas.fixture.json');
      const parsed = GeneratedIdeasSchema.parse(fixture);

      expect(parsed.ideas.length).toBe(3);
      expect(parsed.ideas[0]?.category).toBe('theme');
      expect(parsed.ideas[0]?.culturalContext).toBe('Traditional South Asian');
      expect(parsed.ideas[0]?.tags).toContain('marigold');
    });

    it('rejects ideas fixture when cost tier is invalid or description is missing', () => {
      const brokenFixture = {
        ideas: [
          {
            id: 'broken-idea',
            category: 'theme',
            title: 'Idea without description',
            estimatedCostTier: 'ultra_mega_luxury', // illegal enum value
          },
        ],
      };

      expect(() => GeneratedIdeasSchema.parse(brokenFixture)).toThrowError();
    });
  });

  describe('ToolCallSchema Contract', () => {
    it('validates golden tool call fixtures against tool schemas', () => {
      const fixture = loadFixture<{ toolCalls: unknown[] }>('chatToolCall.fixture.json');
      expect(fixture.toolCalls.length).toBe(3);

      for (const call of fixture.toolCalls) {
        const parsed = ToolCallSchema.parse(call);
        expect(['add_task', 'update_budget_item', 'shortlist_vendor']).toContain(parsed.tool);
      }
    });

    it('rejects tool calls with unknown tool names or missing required parameters', () => {
      const brokenCall = {
        tool: 'delete_entire_database',
        parameters: { force: true },
      };

      expect(() => ToolCallSchema.parse(brokenCall)).toThrowError();
    });
  });
});
