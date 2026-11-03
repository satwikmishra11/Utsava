'use client';

import React, { useState } from 'react';
import { Radio, ChevronDown, ChevronUp } from 'lucide-react';
import { TimelineItem } from '@/domain/types';
import { EventType } from '@/domain/schemas';
import {
  generateProductionCues,
  filterCuesByRole,
  calculateCueSummary,
  CueCrewRole,
} from '@/domain/timeline/cueSheet';
import { CueTable } from './CueTable';

interface ProductionCueSheetProps {
  readonly items: readonly TimelineItem[];
  readonly eventType: EventType;
}

const TOGGLE_BTN_STYLE: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

function CueSheetToggle({
  isOpen,
  tightCount,
  onToggle,
}: {
  readonly isOpen: boolean;
  readonly tightCount: number;
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      id="btn-toggle-cue-sheet"
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="production-cue-sheet-content"
      className="btn"
      style={TOGGLE_BTN_STYLE}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
        <Radio size={16} aria-hidden={true} style={{ color: 'var(--accent-gold)' }} />
        <span>Production Cue Sheet & AV / Tech Rider</span>
        {tightCount > 0 && (
          <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
            {tightCount} Tight Turnaround{tightCount > 1 ? 's' : ''}
          </span>
        )}
      </span>
      {isOpen ? (
        <ChevronUp size={16} aria-hidden={true} />
      ) : (
        <ChevronDown size={16} aria-hidden={true} />
      )}
    </button>
  );
}

function CueKpiCard({
  label,
  value,
  highlight,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly highlight?: boolean;
}): React.JSX.Element {
  return (
    <div className="card" style={{ padding: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: highlight ? 'var(--accent-amber)' : 'inherit',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CueSheetKpis({
  total,
  tightCount,
  avCount,
  stageCount,
}: {
  readonly total: number;
  readonly tightCount: number;
  readonly avCount: number;
  readonly stageCount: number;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        marginBottom: '12px',
      }}
    >
      <CueKpiCard label="Total Cues" value={total} />
      <CueKpiCard label="Tight Buffers (<10m)" value={tightCount} highlight={tightCount > 0} />
      <CueKpiCard label="AV / Lighting Cues" value={avCount} />
      <CueKpiCard label="Stage & MC Prompts" value={stageCount} />
    </div>
  );
}

const ROLE_OPTIONS: readonly { readonly id: CueCrewRole; readonly label: string }[] = [
  { id: 'all', label: 'All Cues' },
  { id: 'av_lighting', label: 'AV & Lighting' },
  { id: 'stage_mc', label: 'Stage & MC' },
  { id: 'hospitality', label: 'Hospitality' },
];

function CueRoleFilter({
  selected,
  onSelect,
}: {
  readonly selected: CueCrewRole;
  readonly onSelect: (r: CueCrewRole) => void;
}): React.JSX.Element {
  return (
    <div
      style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}
      role="group"
      aria-label="Filter cues by crew role"
    >
      {ROLE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={`btn ${selected === opt.id ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          aria-pressed={selected === opt.id}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface CueSheetContentProps {
  readonly summary: ReturnType<typeof calculateCueSummary>;
  readonly selectedRole: CueCrewRole;
  readonly onSelectRole: (role: CueCrewRole) => void;
  readonly visibleCues: readonly ReturnType<typeof generateProductionCues>[number][];
}

function CueSheetContent({
  summary,
  selectedRole,
  onSelectRole,
  visibleCues,
}: CueSheetContentProps): React.JSX.Element {
  return (
    <div
      id="production-cue-sheet-content"
      style={{ padding: '12px', borderTop: '1px solid var(--border)' }}
    >
      <CueSheetKpis
        total={summary.totalCues}
        tightCount={summary.tightTurnaroundsCount}
        avCount={summary.avLightingCount}
        stageCount={summary.stageMcCount}
      />
      <CueRoleFilter selected={selectedRole} onSelect={onSelectRole} />
      <CueTable cues={visibleCues} />
    </div>
  );
}

export function ProductionCueSheet({
  items,
  eventType,
}: ProductionCueSheetProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CueCrewRole>('all');

  const allCues = generateProductionCues(items, eventType);
  const visibleCues = filterCuesByRole(allCues, selectedRole);
  const summary = calculateCueSummary(allCues);

  if (items.length === 0) return <></>;

  return (
    <div
      style={{
        margin: '12px 0',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-secondary)',
      }}
    >
      <CueSheetToggle
        isOpen={isOpen}
        tightCount={summary.tightTurnaroundsCount}
        onToggle={() => setIsOpen((prev) => !prev)}
      />
      {isOpen && (
        <CueSheetContent
          summary={summary}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          visibleCues={visibleCues}
        />
      )}
    </div>
  );
}
