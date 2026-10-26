import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from './Button';

export interface AiSuggestionsBannerProps {
  readonly title: React.ReactNode;
  readonly description: React.ReactNode;
  readonly acceptLabel: string;
  readonly dismissLabel: string;
  readonly acceptId: string;
  readonly dismissId: string;
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
}

export function AiSuggestionsBanner({
  title,
  description,
  acceptLabel,
  dismissLabel,
  acceptId,
  dismissId,
  onAccept,
  onDismiss,
}: AiSuggestionsBannerProps): React.JSX.Element {
  return (
    <div className="ai-banner">
      <div className="ai-banner-content">
        <div>
          <span className="ai-banner-title">{title}</span>
          <p className="ai-banner-description">{description}</p>
        </div>
        <div className="ai-banner-actions">
          <Button
            onClick={onAccept}
            size="sm"
            variant="primary"
            leftIcon={<Check size={14} />}
            id={acceptId}
          >
            {acceptLabel}
          </Button>
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            leftIcon={<X size={14} />}
            id={dismissId}
          >
            {dismissLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
