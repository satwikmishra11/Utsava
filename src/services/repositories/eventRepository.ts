import { Event, BudgetItem, TimelineTask, Vendor, IdeaSet, EventType } from '@/domain/schemas';

export interface EventQueryOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly type?: EventType;
}

export interface EventDetails {
  readonly event: Event;
  readonly budgetItems: readonly BudgetItem[];
  readonly timelineTasks: readonly TimelineTask[];
  readonly vendors: readonly Vendor[];
  readonly ideaSets: readonly IdeaSet[];
}

export interface EventRepository {
  createEvent(event: Event): Promise<Event>;
  getEventById(id: string, userId?: string): Promise<Event | null>;
  listEvents(userId?: string, options?: EventQueryOptions): Promise<readonly Event[]>;
  countEvents(userId?: string, type?: EventType): Promise<number>;
  getEventWithDetails(id: string, userId?: string): Promise<EventDetails | null>;
  getBatchEventsWithDetails(
    eventIds: readonly string[],
    userId?: string
  ): Promise<readonly EventDetails[]>;
  updateEvent(id: string, updates: Partial<Event>, userId?: string): Promise<Event | null>;
  deleteEvent(id: string, userId?: string): Promise<boolean>;
  isEventOwner(eventId: string, userId: string): Promise<boolean>;

  addBudgetItem(item: BudgetItem): Promise<BudgetItem>;
  getBudgetItems(eventId: string): Promise<readonly BudgetItem[]>;
  updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem | null>;
  deleteBudgetItem(id: string): Promise<boolean>;

  addTimelineTask(task: TimelineTask): Promise<TimelineTask>;
  getTimelineTasks(eventId: string): Promise<readonly TimelineTask[]>;
  updateTimelineTask(id: string, updates: Partial<TimelineTask>): Promise<TimelineTask | null>;
  deleteTimelineTask(id: string): Promise<boolean>;

  addVendor(vendor: Vendor): Promise<Vendor>;
  getVendors(eventId: string): Promise<readonly Vendor[]>;
  updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null>;
  deleteVendor(id: string): Promise<boolean>;

  saveIdeaSet(ideaSet: IdeaSet): Promise<IdeaSet>;
  getIdeaSets(eventId: string): Promise<readonly IdeaSet[]>;
}
