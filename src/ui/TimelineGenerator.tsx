'use client';

import React, { useState } from 'react';
import { TimelineItem, TimelinePhase, EventType } from '@/domain/types';
import { findTimelineConflicts, filterTimelineByPhase } from '@/domain/timeline';
import { Clock, AlertCircle, Plus, Sparkles, CheckSquare, Square } from 'lucide-react';

interface TimelineGeneratorProps {
  readonly items: readonly TimelineItem[];
  readonly eventType: EventType;
  readonly onAddItem: (item: TimelineItem) => void;
  readonly onToggleComplete: (id: string) => void;
  readonly onBulkReplaceTimeline: (items: readonly TimelineItem[]) => void;
}

export function TimelineGenerator({
  items,
  eventType,
  onAddItem,
  onToggleComplete,
  onBulkReplaceTimeline,
}: TimelineGeneratorProps): React.JSX.Element {
  const [phaseFilter, setPhaseFilter] = useState<TimelinePhase | 'all'>('all');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState('60');
  const [isGenerating, setIsGenerating] = useState(false);

  const conflicts = findTimelineConflicts(items);
  const displayedItems = phaseFilter === 'all' ? items : filterTimelineByPhase(items, phaseFilter);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          eventStartTime: time,
          durationHours: 6,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.timelineItems) onBulkReplaceTimeline(json.timelineItems);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddItem({
      id: `time-${Date.now()}`,
      phase: 'ceremony',
      title: title.trim(),
      time,
      durationMinutes: Number(duration) || 30,
      completed: false,
    });
    setTitle('');
  };

  return (
    <section id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Run of Show & Timeline</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Ensure seamless coordination across every milestone and ritual.
          </p>
        </div>
        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="btn btn-primary"
          id="btn-generate-ai-timeline"
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>{isGenerating ? 'Synthesizing...' : 'AI Auto-Schedule'}</span>
        </button>
      </div>

      {conflicts.length > 0 && (
        <div role="alert" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 600 }}>
            <AlertCircle size={18} aria-hidden="true" />
            <span>Schedule Overlap Detected ({conflicts.length})</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '4px' }}>
            {conflicts[0]?.itemA.title} ({conflicts[0]?.itemA.time}) overlaps with {conflicts[0]?.itemB.title} ({conflicts[0]?.itemB.time}).
          </p>
        </div>
      )}

      {/* Add Milestone Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 200px' }}>
          <label htmlFor="timeline-title" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Milestone / Activity
          </label>
          <input
            id="timeline-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Guest Reception & Welcome Drinks"
            required
          />
        </div>
        <div style={{ flex: '1 1 100px' }}>
          <label htmlFor="timeline-time" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Start Time
          </label>
          <input
            id="timeline-time"
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div style={{ flex: '1 1 100px' }}>
          <label htmlFor="timeline-duration" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Duration (min)
          </label>
          <input
            id="timeline-duration"
            type="number"
            min="5"
            className="input"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-secondary" id="btn-add-timeline-item">
          <Plus size={16} aria-hidden="true" />
          <span>Add</span>
        </button>
      </form>

      {/* Phase Filter Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['all', 'preparation', 'ceremony', 'reception', 'teardown'] as const).map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => setPhaseFilter(phase)}
            className={phaseFilter === phase ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayedItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: `4px solid ${item.completed ? 'var(--accent-emerald)' : 'var(--accent-gold)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => onToggleComplete(item.id)}
                className="btn btn-secondary"
                style={{ padding: '6px', background: 'transparent', border: 'none' }}
                aria-label={item.completed ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as completed`}
              >
                {item.completed ? (
                  <CheckSquare size={20} color="var(--accent-emerald)" aria-hidden="true" />
                ) : (
                  <Square size={20} color="var(--text-muted)" aria-hidden="true" />
                )}
              </button>
              <div>
                <p style={{ fontWeight: 600, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {item.title}
                </p>
                <span className="badge badge-gold" style={{ marginTop: '4px', fontSize: '0.75rem' }}>{item.phase}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Clock size={16} aria-hidden="true" />
              <span>{item.time} ({item.durationMinutes} min)</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
