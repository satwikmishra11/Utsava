'use client';

import React, { useRef } from 'react';
import { EventPlan } from '@/domain/types';
import { Button } from '../ui/Button';
import { Printer, Copy, Download, Upload } from 'lucide-react';
import {
  copyToClipboard,
  exportBudgetToCSV,
  exportTimelineToCSV,
  exportVendorsToCSV,
  exportPlanToJSON,
  generateEventBriefText,
} from '@/lib/exportUtils';

function handleFileUpload(
  file: File,
  onImport: (content: string) => void,
  onClose: () => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result;
    if (typeof content === 'string') {
      onImport(content);
      onClose();
    }
  };
  reader.readAsText(file);
}

function useBriefActions(plan: EventPlan, showToast: (msg: string) => void) {
  const handleCopyText = async () => {
    const text = generateEventBriefText(plan);
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Event brief copied to clipboard!' : 'Unable to copy brief.');
  };

  const handleExportAll = () => {
    exportBudgetToCSV(plan);
    exportTimelineToCSV(plan);
    exportVendorsToCSV(plan);
    showToast('Exported complete event package (3 CSVs).');
  };

  return { handleCopyText, handleExportAll };
}

function ImportBackupButton({
  onImportJSON,
  onClose,
}: {
  readonly onImportJSON: (jsonString: string) => void;
  readonly onClose: () => void;
}): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, onImportJSON, onClose);
        }}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        leftIcon={<Upload size={14} />}
      >
        Import Backup
      </Button>
    </>
  );
}

function ExportBackupActions({
  plan,
  onExportAll,
}: {
  readonly plan: EventPlan;
  readonly onExportAll: () => void;
}): React.JSX.Element {
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => exportPlanToJSON(plan)}
        leftIcon={<Download size={14} />}
      >
        Backup JSON
      </Button>
      <Button variant="secondary" size="sm" onClick={onExportAll} leftIcon={<Download size={14} />}>
        Export All CSVs
      </Button>
    </>
  );
}

function PrintAndCopyActions({
  onCopyText,
}: {
  readonly onCopyText: () => void;
}): React.JSX.Element {
  return (
    <>
      <Button variant="secondary" size="sm" onClick={onCopyText} leftIcon={<Copy size={14} />}>
        Copy Text
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => window.print()}
        leftIcon={<Printer size={14} />}
      >
        Print Brief (PDF)
      </Button>
    </>
  );
}

export interface BriefActionButtonsProps {
  readonly plan: EventPlan;
  readonly showToast: (msg: string) => void;
  readonly onImportJSON: (jsonString: string) => void;
  readonly onClose: () => void;
}

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  borderTop: '1px solid var(--border-subtle)',
  paddingTop: '16px',
};

export function BriefActionButtons(props: BriefActionButtonsProps): React.JSX.Element {
  const { handleCopyText, handleExportAll } = useBriefActions(props.plan, props.showToast);

  return (
    <div style={CONTAINER_STYLE}>
      <ImportBackupButton onImportJSON={props.onImportJSON} onClose={props.onClose} />
      <ExportBackupActions plan={props.plan} onExportAll={handleExportAll} />
      <PrintAndCopyActions onCopyText={handleCopyText} />
    </div>
  );
}
