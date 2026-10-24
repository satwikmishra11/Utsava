import { DrizzleEventRepository } from './drizzleEventRepository';
import { EventRepository } from './eventRepository';

let defaultRepo: EventRepository | null = null;

export function getEventRepository(): EventRepository {
  if (!defaultRepo) {
    defaultRepo = new DrizzleEventRepository();
  }
  return defaultRepo;
}

export function setEventRepository(repo: EventRepository | null): void {
  defaultRepo = repo;
}

export * from './eventRepository';
export * from './drizzleEventRepository';
