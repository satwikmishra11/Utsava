import React from 'react';
import { GeneratedTimelineTask } from '@/services/ai';
import { AiSuggestionsBanner } from '../ui/AiSuggestionsBanner';

export interface TimelineSuggestionsAlertProps {
  readonly suggestions: readonly GeneratedTimelineTask[];
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
}

export function TimelineSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
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
    />
  );
}
