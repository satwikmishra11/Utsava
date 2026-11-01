'use client';

import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Phone, Mail } from 'lucide-react';
import { EventPlan } from '@/domain/types';
import {
  getContingencyProtocols,
  buildEmergencyVendorCallSheet,
  ContingencyProtocol,
  EmergencyVendorContact,
} from '@/domain/contingency';

interface BriefContingencySectionProps {
  readonly plan: EventPlan;
}

function ProtocolRow({ protocol }: { readonly protocol: ContingencyProtocol }): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '6px', fontWeight: 600 }}>{protocol.title}</td>
      <td style={{ padding: '6px', color: 'var(--text-secondary)' }}>
        {protocol.triggerCondition}
      </td>
      <td style={{ padding: '6px' }}>{protocol.mitigationAction}</td>
      <td style={{ padding: '6px', whiteSpace: 'nowrap', color: 'var(--accent-gold)' }}>
        {protocol.designatedLead}
      </td>
    </tr>
  );
}

function ContingencyProtocolTable({
  protocols,
}: {
  readonly protocols: readonly ContingencyProtocol[];
}): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto', marginTop: '10px' }}>
      <h4
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '6px',
        }}
      >
        Operational Risk & Plan B Protocols
      </h4>
      <table className="table" style={{ width: '100%', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th scope="col" style={{ padding: '6px' }}>
              Risk Scenario
            </th>
            <th scope="col" style={{ padding: '6px' }}>
              Trigger Condition
            </th>
            <th scope="col" style={{ padding: '6px' }}>
              Plan B Action
            </th>
            <th scope="col" style={{ padding: '6px' }}>
              Lead
            </th>
          </tr>
        </thead>
        <tbody>
          {protocols.map((p) => (
            <ProtocolRow key={p.id} protocol={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TEL_STYLE = {
  display: 'inline-flex',
  gap: '4px',
  alignItems: 'center',
  color: 'var(--accent-gold)',
} as const;

const MAIL_STYLE = {
  display: 'inline-flex',
  gap: '4px',
  alignItems: 'center',
  color: 'var(--text-secondary)',
} as const;

function EmergencyContactRow({
  contact,
}: {
  readonly contact: EmergencyVendorContact;
}): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '6px', fontWeight: 600 }}>
        {contact.vendorName}{' '}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          ({contact.category})
        </span>
      </td>
      <td style={{ padding: '6px' }}>{contact.assignedMilestone}</td>
      <td style={{ padding: '6px' }}>
        <a href={`tel:${contact.phone}`} style={TEL_STYLE}>
          <Phone size={12} aria-hidden={true} /> {contact.phone}
        </a>
      </td>
      <td style={{ padding: '6px' }}>
        <a href={`mailto:${contact.email}`} style={MAIL_STYLE}>
          <Mail size={12} aria-hidden={true} /> {contact.email}
        </a>
      </td>
    </tr>
  );
}

function EmergencyCallSheetTable({
  contacts,
}: {
  readonly contacts: readonly EmergencyVendorContact[];
}): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto', marginTop: '14px' }}>
      <h4
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '6px',
        }}
      >
        Day-Of Vendor Emergency Call Sheet
      </h4>
      <table className="table" style={{ width: '100%', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th scope="col" style={{ padding: '6px' }}>
              Vendor & Category
            </th>
            <th scope="col" style={{ padding: '6px' }}>
              Milestone / Call Time
            </th>
            <th scope="col" style={{ padding: '6px' }}>
              Emergency Phone
            </th>
            <th scope="col" style={{ padding: '6px' }}>
              Email
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <EmergencyContactRow key={c.vendorName} contact={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TOGGLE_BTN_STYLE = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  background: 'transparent',
} as const;

function ContingencyToggle({
  isOpen,
  onToggle,
}: {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      id="btn-toggle-contingency-protocols"
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="contingency-section-content"
      className="btn"
      style={TOGGLE_BTN_STYLE}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 600,
          fontSize: '0.85rem',
        }}
      >
        <ShieldAlert size={14} aria-hidden={true} style={{ color: 'var(--accent-gold)' }} />
        <span>Day-Of Contingency Protocols & Emergency Call Sheet</span>
      </span>
      {isOpen ? (
        <ChevronUp size={14} aria-hidden={true} />
      ) : (
        <ChevronDown size={14} aria-hidden={true} />
      )}
    </button>
  );
}

export function BriefContingencySection({ plan }: BriefContingencySectionProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const protocols = getContingencyProtocols(plan.eventType);
  const contacts = buildEmergencyVendorCallSheet(plan.vendors, plan.timelineItems);

  return (
    <div
      style={{
        marginTop: '12px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        background: 'var(--bg-secondary)',
      }}
    >
      <ContingencyToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <div
          id="contingency-section-content"
          style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}
        >
          <ContingencyProtocolTable protocols={protocols} />
          <EmergencyCallSheetTable contacts={contacts} />
        </div>
      )}
    </div>
  );
}
