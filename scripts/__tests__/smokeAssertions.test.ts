import { describe, it, expect } from 'vitest';
import {
  assertValidAiSource,
  assertChatNotCanned,
  compareItemTitles,
  compareBudgetAllocations,
  compareChatReplies,
  formatSmokeSummaryTable,
  OLD_CANNED_CHAT_REPLY,
} from '../smokeAssertions';

describe('smokeAssertions Unit Tests', () => {
  describe('assertValidAiSource', () => {
    it('accepts genuine llm and retry provenance sources', () => {
      expect(assertValidAiSource('llm').ok).toBe(true);
      expect(assertValidAiSource('retry').ok).toBe(true);
    });

    it('rejects fallback source with descriptive reason', () => {
      const res = assertValidAiSource('fallback');
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('fallback');
    });

    it('rejects undefined or invalid sources', () => {
      expect(assertValidAiSource(undefined).ok).toBe(false);
      expect(assertValidAiSource('invalid_src').ok).toBe(false);
    });
  });

  describe('assertChatNotCanned', () => {
    it('rejects legacy canned catering response', () => {
      const res = assertChatNotCanned(OLD_CANNED_CHAT_REPLY);
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('canned');
    });

    it('rejects empty response', () => {
      const res = assertChatNotCanned('   ');
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('empty');
    });

    it('accepts genuine conversational responses', () => {
      const res = assertChatNotCanned(
        'For your Delhi wedding, I suggest allocating 35% to authentic catering.'
      );
      expect(res.ok).toBe(true);
    });
  });

  describe('compareItemTitles', () => {
    it('accepts lists with distinct titles', () => {
      const weddingIdeas = [
        { title: 'Royal Mandap Floral Arch' },
        { title: 'Sangeet Choreography Zone' },
      ];
      const safariIdeas = [
        { title: 'Jungle Animal Face Painting' },
        { title: 'Savannah Scavenger Hunt' },
      ];
      const res = compareItemTitles(weddingIdeas, safariIdeas, 'Ideas');
      expect(res.ok).toBe(true);
    });

    it('rejects lists with high overlap', () => {
      const listA = [{ title: 'Decor' }, { title: 'Catering' }];
      const listB = [{ title: 'Decor' }, { title: 'Catering' }];
      const res = compareItemTitles(listA, listB, 'Titles');
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('overlap too high');
    });

    it('rejects empty input lists', () => {
      const res = compareItemTitles([], [{ title: 'Solo' }], 'Items');
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('Empty');
    });
  });

  describe('compareBudgetAllocations', () => {
    it('accepts budgets with distinct allocations', () => {
      const budgetA = [{ category: 'venue', estimated: 500000 }];
      const budgetB = [{ category: 'venue', estimated: 15000 }];
      expect(compareBudgetAllocations(budgetA, budgetB).ok).toBe(true);
    });

    it('rejects budgets with identical sums and scopes', () => {
      const budgetA = [{ category: 'catering', estimated: 25000 }];
      const budgetB = [{ category: 'catering', estimated: 25000 }];
      const res = compareBudgetAllocations(budgetA, budgetB);
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('Identical total budget');
    });

    it('rejects empty budgets', () => {
      expect(compareBudgetAllocations([], []).ok).toBe(false);
    });
  });

  describe('compareChatReplies', () => {
    it('accepts different, non-canned chat replies', () => {
      const res = compareChatReplies(
        'Delhi wedding catering recommendation.',
        'Pune safari kids birthday scavenger plan.'
      );
      expect(res.ok).toBe(true);
    });

    it('rejects identical replies', () => {
      const res = compareChatReplies('Same reply here.', 'Same reply here.');
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('Identical chat responses');
    });
  });

  describe('formatSmokeSummaryTable', () => {
    it('formats a tabular string with expected columns', () => {
      const formatted = formatSmokeSummaryTable([
        {
          endpoint: '/api/ideas',
          status: 'PASS',
          provider: 'gemini',
          source: 'llm',
          latencyMs: 1450,
          details: 'Distinct outputs verified',
        },
      ]);
      expect(formatted).toContain('/api/ideas');
      expect(formatted).toContain('PASS');
      expect(formatted).toContain('gemini');
      expect(formatted).toContain('1450ms');
    });
  });
});
