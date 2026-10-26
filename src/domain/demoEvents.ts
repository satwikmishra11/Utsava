import { EventPlan, EventType } from './types';
import { DEMO_INDIAN_WEDDING, DEMO_CHILD_BIRTHDAY, DEMO_COMMUNITY_FUNDRAISER } from './demo';

export { DEMO_INDIAN_WEDDING, DEMO_CHILD_BIRTHDAY, DEMO_COMMUNITY_FUNDRAISER };

export const DEMO_EVENTS: readonly EventPlan[] = [
  DEMO_INDIAN_WEDDING,
  DEMO_CHILD_BIRTHDAY,
  DEMO_COMMUNITY_FUNDRAISER,
];

export function getDemoEventByType(type: EventType): EventPlan {
  switch (type) {
    case 'wedding':
      return DEMO_INDIAN_WEDDING;
    case 'birthday':
      return DEMO_CHILD_BIRTHDAY;
    case 'community':
      return DEMO_COMMUNITY_FUNDRAISER;
  }
}

export function getDemoEventById(id: string): EventPlan | undefined {
  return DEMO_EVENTS.find((event) => event.id === id);
}
