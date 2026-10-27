/**
 * Tracks AI token burn, cache effectiveness, and estimated costs in memory,
 * providing real-time telemetry to developers and observability instrumentation.
 */

export interface TokenUsageRecord {
  readonly id: string;
  readonly timestamp: string;
  readonly capability: 'budget' | 'timeline' | 'vendor' | 'ideas' | 'chat';
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly durationMs: number;
  readonly model: string;
  readonly cached: boolean;
}

export interface TokenUsageSummary {
  readonly totalTokens: number;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly requestCount: number;
  readonly cacheHitCount: number;
  readonly estimatedCostUsd: number;
}

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Standard rule of thumb: ~4 characters per token for English
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

class TokenTracker {
  private records: TokenUsageRecord[] = [];
  private readonly listeners = new Set<() => void>();

  public record(
    entry: Omit<TokenUsageRecord, 'id' | 'timestamp' | 'totalTokens'> & {
      readonly totalTokens?: number;
    }
  ): TokenUsageRecord {
    const totalTokens = entry.totalTokens ?? entry.promptTokens + entry.completionTokens;
    const record: TokenUsageRecord = {
      id: `tok-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
      capability: entry.capability,
      promptTokens: entry.promptTokens,
      completionTokens: entry.completionTokens,
      totalTokens,
      durationMs: entry.durationMs,
      model: entry.model,
      cached: entry.cached,
    };

    this.records.unshift(record);
    if (this.records.length > 100) {
      this.records.pop();
    }

    this.notify();
    return record;
  }

  public getRecords(): readonly TokenUsageRecord[] {
    return this.records;
  }

  public getSummary(): TokenUsageSummary {
    let promptTokens = 0;
    let completionTokens = 0;
    let cacheHitCount = 0;

    for (const r of this.records) {
      promptTokens += r.promptTokens;
      completionTokens += r.completionTokens;
      if (r.cached) cacheHitCount++;
    }

    const totalTokens = promptTokens + completionTokens;
    // Blended estimate: $3 per million input, $15 per million output
    const cost = (promptTokens * 3) / 1_000_000 + (completionTokens * 15) / 1_000_000;

    return {
      totalTokens,
      promptTokens,
      completionTokens,
      requestCount: this.records.length,
      cacheHitCount,
      estimatedCostUsd: Number(cost.toFixed(4)),
    };
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public clear(): void {
    this.records = [];
    this.notify();
  }

  private notify(): void {
    for (const cb of this.listeners) {
      try {
        cb();
      } catch {
        // Safe notification
      }
    }
  }
}

export const tokenTracker = new TokenTracker();
