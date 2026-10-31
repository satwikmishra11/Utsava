'use client';

import React from 'react';
import { EventPlan } from '@/domain/types';
import { Dialog } from './ui/Dialog';
import {
  BriefMetadataSection,
  BriefFinancialSnapshot,
  BriefRunOfShowSection,
  BriefVendorSummary,
  BriefActionButtons,
} from './brief';

export interface EventBriefDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly plan: EventPlan;
  readonly onImportJSON: (jsonString: string) => void;
  readonly showToast: (msg: string) => void;
}

export function EventBriefDialog(props: EventBriefDialogProps): React.JSX.Element | null {
  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={`Event Master Brief: ${props.plan.title}`}
      maxWidth="800px"
    >
      <div style={{ padding: '12px 0 0 0' }}>
        <BriefMetadataSection plan={props.plan} />
        <BriefFinancialSnapshot plan={props.plan} />
        <BriefRunOfShowSection plan={props.plan} />
        <BriefVendorSummary plan={props.plan} />
        <BriefActionButtons
          plan={props.plan}
          showToast={props.showToast}
          onImportJSON={props.onImportJSON}
          onClose={props.onClose}
        />
      </div>
    </Dialog>
  );
}
