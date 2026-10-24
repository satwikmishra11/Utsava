'use client';

import React, { useState } from 'react';
import { IdeaRecommendation, EventType } from '@/domain/types';
import { Sparkles, Tag, Plus, Check } from 'lucide-react';

interface IdeaGeneratorProps {
  readonly eventType: EventType;
  readonly guestCount: number;
  readonly culturalContext?: string;
  readonly ideas: readonly IdeaRecommendation[];
  readonly onSaveIdea: (idea: IdeaRecommendation) => void;
  readonly onBulkAddIdeas: (ideas: readonly IdeaRecommendation[]) => void;
}

export function IdeaGenerator({
  eventType,
  guestCount,
  culturalContext = '',
  ideas,
  onSaveIdea,
  onBulkAddIdeas,
}: IdeaGeneratorProps): React.JSX.Element {
  const [culture, setCulture] = useState(culturalContext);
  const [tier, setTier] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          guestCount,
          culturalContext: culture.trim() || undefined,
          budgetTier: tier,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.ideas) onBulkAddIdeas(json.ideas);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (idea: IdeaRecommendation) => {
    onSaveIdea(idea);
    setSavedIds((prev) => new Set(prev).add(idea.id));
  };

  return (
    <section id="panel-ideas" role="tabpanel" aria-labelledby="tab-ideas" className="card">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Personalized Event Idea Studio</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Explore curated themes, bespoke decor installations, and cultural traditions.
        </p>
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 200px' }}>
          <label htmlFor="idea-culture" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Cultural Context / Heritage
          </label>
          <input
            id="idea-culture"
            className="input"
            value={culture}
            onChange={(e) => setCulture(e.target.value)}
            placeholder="e.g. South Asian Bollywood, Bohemian Rustic, Vintage Noir"
          />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label htmlFor="idea-tier" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Budget Tier
          </label>
          <select
            id="idea-tier"
            className="select"
            value={tier}
            onChange={(e) => setTier(e.target.value as 'budget' | 'moderate' | 'luxury')}
          >
            <option value="budget">Value / Budget</option>
            <option value="moderate">Moderate / Refined</option>
            <option value="luxury">Luxury / Extravagant</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" id="btn-generate-ideas">
          <Sparkles size={16} aria-hidden="true" />
          <span>{loading ? 'Synthesizing...' : 'Generate AI Concepts'}</span>
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {ideas.map((idea) => (
          <div key={idea.id} style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="badge badge-gold">{idea.category}</span>
                <span className="badge badge-emerald">Cost: {idea.estimatedCostTier}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>{idea.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>{idea.description}</p>
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {idea.tags.map((t, idx) => (
                  <span key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{t}</span>
                ))}
              </div>
              <button
                onClick={() => handleSave(idea)}
                disabled={savedIds.has(idea.id)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                aria-label={`Save ${idea.title} to event plan`}
              >
                {savedIds.has(idea.id) ? (
                  <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} aria-hidden="true" /> Saved
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} aria-hidden="true" /> Save
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
