import React from 'react';
import { GeneratedTimelineTask } from '@/services/ai';
import { AiSuggestionsBanner } from '../ui/AiSuggestionsBanner';
import { ProvenanceSource } from '../ui/ProvenanceBadge';

export interface TimelineSuggestionsAlertProps {
  readonly suggestions: readonly GeneratedTimelineTask[];
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
  readonly source?: ProvenanceSource;
}

export function TimelineSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
  source = 'llm',
}: TimelineSuggestionsAlertProps): React.JSX.Element {
  return (
    <AiSuggestionsBanner
      title="✨ AI Timeline Schedule Ready"
      description={`${suggestions.length} back-scheduled milestones generated.`}
      acceptLabel="Accept Schedule"
      dismissLabel="Dismiss"
      acceptId="btn-accept-timeline-ai"
      dismissId="btn-dismiss-timeline-ai"
      onAccept={onAccept}
      onDismiss={onDismiss}
      source={source}
    />
  );
}
