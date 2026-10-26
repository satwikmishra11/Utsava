import { useState } from 'react';
import { IdeaRecommendation, IdeaCategory } from '@/domain/types';

export function useIdeaGallery(
  ideas: readonly IdeaRecommendation[],
  onSaveIdea: (idea: IdeaRecommendation) => void
) {
  const [selectedCat, setSelectedCat] = useState<IdeaCategory | 'all'>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const displayed = selectedCat === 'all' ? ideas : ideas.filter((i) => i.category === selectedCat);
  const handleSave = (idea: IdeaRecommendation) => {
    onSaveIdea(idea);
    setSavedIds((prev) => new Set(prev).add(idea.id));
  };

  return { selectedCat, setSelectedCat, displayed, savedIds, handleSave };
}
