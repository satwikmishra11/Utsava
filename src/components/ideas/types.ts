import { IdeaRecommendation, IdeaCategory } from '@/domain/types';
import { EventType } from '@/domain/schemas';
import { ProvenanceSource } from '../ui/ProvenanceBadge';

export interface IdeaGeneratorProps {
  readonly eventType: EventType;
  readonly guestCount: number;
  readonly culturalContext?: string;
  readonly ideas: readonly IdeaRecommendation[];
  readonly onSaveIdea: (idea: IdeaRecommendation) => void;
  readonly onBulkAddIdeas: (ideas: readonly IdeaRecommendation[]) => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly IdeaRecommendation[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
  readonly aiSource?: ProvenanceSource;
}

export const CATEGORIES: readonly (IdeaCategory | 'all')[] = [
  'all',
  'theme',
  'decor',
  'entertainment',
  'food_beverage',
  'cultural',
];
