'use client';

import React from 'react';
import { AlertTriangle, Mic, Sparkles, Utensils } from 'lucide-react';
import { CueCrewRole, ProductionCue } from '@/domain/timeline/cueSheet';

export function CueTableHeader(): React.JSX.Element {
  return (
    <thead>
      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
        <th scope="col" style={{ padding: '6px' }}>
          Time
        </th>
        <th scope="col" style={{ padding: '6px' }}>
          Milestone & Role
        </th>
        <th scope="col" style={{ padding: '6px' }}>
          AV / Lighting Trigger
        </th>
        <th scope="col" style={{ padding: '6px' }}>
          Emcee Script Prompt
        </th>
        <th scope="col" style={{ padding: '6px' }}>
          Buffer to Next
        </th>
      </tr>
    </thead>
  );
}

function RoleBadge({ role }: { readonly role: Exclude<CueCrewRole, 'all'> }): React.JSX.Element {
  if (role === 'av_lighting') {
    return (
      <span
        className="badge badge-purple"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
      >
        <Sparkles size={10} aria-hidden={true} /> AV / Light
      </span>
    );
  }
  if (role === 'stage_mc') {
    return (
      <span
        className="badge badge-gold"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
      >
        <Mic size={10} aria-hidden={true} /> Stage / MC
      </span>
    );
  }
  return (
    <span
      className="badge badge-emerald"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
    >
      <Utensils size={10} aria-hidden={true} /> Hospitality
    </span>
  );
}

function BufferBadge({
  buffer,
  isTight,
}: {
  readonly buffer: number | null;
  readonly isTight: boolean;
}): React.JSX.Element {
  if (buffer === null) {
    return <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Finale</span>;
  }
  if (isTight) {
    return (
      <span
        className="badge badge-amber"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
      >
        <AlertTriangle size={10} aria-hidden={true} /> {buffer}m tight
      </span>
    );
  }
  return (
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>+{buffer}m buffer</span>
  );
}

function CueRow({ cue }: { readonly cue: ProductionCue }): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
      <td style={{ padding: '6px', fontWeight: 700, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
        {cue.time}
      </td>
      <td style={{ padding: '6px', verticalAlign: 'top' }}>
        <div style={{ fontWeight: 600 }}>{cue.title}</div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
          <RoleBadge role={cue.crewRole} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            · {cue.assignedTo}
          </span>
        </div>
      </td>
      <td style={{ padding: '6px', verticalAlign: 'top', color: 'var(--text-secondary)' }}>
        {cue.avLightingCue}
      </td>
      <td style={{ padding: '6px', verticalAlign: 'top', fontStyle: 'italic' }}>
        &ldquo;{cue.mcPrompt}&rdquo;
      </td>
      <td style={{ padding: '6px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
        <BufferBadge buffer={cue.bufferMinutesToNext} isTight={cue.isTightTurnaround} />
      </td>
    </tr>
  );
}

export function CueTable({ cues }: { readonly cues: readonly ProductionCue[] }): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto', marginTop: '8px' }}>
      <table
        className="table"
        style={{ width: '100%', fontSize: '0.8rem' }}
        aria-label="Production Cue Sheet and AV Tech Rider"
      >
        <CueTableHeader />
        <tbody>
          {cues.map((c) => (
            <CueRow key={c.id} cue={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
