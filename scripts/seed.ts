import Database from 'better-sqlite3';
import path from 'path';
import { DrizzleEventRepository } from '../src/services/repositories/drizzleEventRepository';
import {
  DEMO_INDIAN_WEDDING,
  DEMO_CHILD_BIRTHDAY,
  DEMO_COMMUNITY_FUNDRAISER,
} from '../src/domain/demo';
import { EventPlan } from '../src/domain/types';
import { EventPreferences } from '../src/domain/schemas';

const DB_FILE = process.env.DATABASE_PATH || path.join(process.cwd(), 'utsava.db');

function extractPreferences(plan: EventPlan): EventPreferences {
  if (plan.eventType === 'wedding') {
    return {
      culture: 'South Asian Traditional & Fusion (Punjabi-Gujarati)',
      theme: 'Royal Marigold & Saffron Elegance',
      dietary: ['Pure Vegetarian', 'Jain Options', 'Halal Counter', 'Nut-Free'],
      accessibilityNeeds: [
        'Step-Free Mandap Ramp',
        'Elder Golf Cart Shuttles',
        'Sign Language Captioning',
      ],
    };
  }
  if (plan.eventType === 'birthday') {
    return {
      culture: 'Kids Wildlife Explorer Theme',
      theme: 'Jungle Safari Adventure',
      dietary: ['Peanut-Free', 'Dairy-Free Options', 'Fruit Skewers'],
      accessibilityNeeds: ['Sensory-Friendly Quiet Tent', 'Wheelchair Lawn Mats'],
    };
  }
  return {
    culture: 'Civic Neighborhood Harvest Fair',
    theme: 'Autumn Harvest & Community Unity',
    dietary: ['Kosher Options', 'Vegan & Gluten-Free', 'Compostable Dinnerware'],
    accessibilityNeeds: ['ADA Ramps to Stage', 'ASL Interpreter', 'Audio Induction Loop'],
  };
}

function resolveEventLocation(type: string): string {
  if (type === 'wedding') return 'Royal Heritage Palace & Gardens';
  if (type === 'birthday') return 'Forest Greens Botanical Pavilion';
  return 'Oakridge Civic Plaza';
}

async function seedTimelineTasks(repo: DrizzleEventRepository, plan: EventPlan): Promise<void> {
  for (const item of plan.timelineItems) {
    await repo.addTimelineTask({
      id: item.id,
      eventId: plan.id,
      title: item.title,
      dueDate: plan.date,
      status: item.completed ? 'completed' : 'pending',
      dependsOn: [],
      category: 'venue',
      assignee: item.assignedTo,
    });
  }
}

async function seedVendors(repo: DrizzleEventRepository, plan: EventPlan): Promise<void> {
  for (const vendor of plan.vendors) {
    await repo.addVendor({
      id: vendor.id,
      eventId: plan.id,
      category: vendor.category,
      name: vendor.name,
      contact: vendor.contactEmail ?? 'contact@vendor.test',
      quote: vendor.quotedAmount,
      status: vendor.status,
    });
  }
}

async function seedIdeaSet(
  repo: DrizzleEventRepository,
  plan: EventPlan,
  preferences: EventPreferences
): Promise<void> {
  await repo.saveIdeaSet({
    id: `set-${plan.id}`,
    eventId: plan.id,
    theme: preferences.theme ?? 'Celebration Theme',
    decor: plan.ideas.filter((i) => i.category === 'decor').map((i) => i.title),
    menu: plan.ideas.filter((i) => i.category === 'food_beverage').map((i) => i.title),
    activities: plan.ideas.filter((i) => i.category === 'entertainment').map((i) => i.title),
    generatedMetadata: {
      generatedAt: new Date().toISOString(),
      model: 'utsava-demo-seed',
      tags: ['demo', plan.eventType],
    },
  });
}

async function seedSingleEvent(
  repo: DrizzleEventRepository,
  plan: EventPlan,
  userId: string
): Promise<void> {
  await repo.deleteEvent(plan.id, userId).catch(() => false);
  const preferences = extractPreferences(plan);

  await repo.createEvent({
    id: plan.id,
    userId,
    type: plan.eventType,
    title: plan.title,
    date: plan.date,
    guestCount: plan.guestCount,
    location: resolveEventLocation(plan.eventType),
    totalBudget: plan.totalBudget,
    currency: plan.currency,
    preferences,
    createdAt: new Date().toISOString(),
  });

  for (const item of plan.budgetItems) {
    await repo.addBudgetItem(item);
  }
  await seedTimelineTasks(repo, plan);
  await seedVendors(repo, plan);
  await seedIdeaSet(repo, plan, preferences);
}

export async function seedDatabase(targetDbPath?: string): Promise<void> {
  const dbPath = targetDbPath || DB_FILE;
  console.log(`\n🌱 Seeding Utsava SQLite Database at: ${dbPath}`);

  const sqlite = new Database(dbPath);
  const repo = new DrizzleEventRepository(sqlite);
  const demoUserId = 'usr_demo';

  const demoEvents = [DEMO_INDIAN_WEDDING, DEMO_CHILD_BIRTHDAY, DEMO_COMMUNITY_FUNDRAISER];

  for (const demo of demoEvents) {
    await seedSingleEvent(repo, demo, demoUserId);
    console.log(`  ✅ Seeded: ${demo.title}`);
    console.log(
      `     • Type: ${demo.eventType.toUpperCase()} | Budget: ${demo.currency} ${demo.totalBudget.toLocaleString()} | Guests: ${demo.guestCount}`
    );
    console.log(
      `     • ${demo.budgetItems.length} Budget Items | ${demo.timelineItems.length} Milestones | ${demo.vendors.length} Vendors | ${demo.ideas.length} Ideas`
    );
  }

  sqlite.close();
  console.log('\n✨ Database seeded successfully with 3 realistic demo events!\n');
}

if (process.env.NODE_ENV !== 'test') {
  seedDatabase().catch((err) => {
    console.error('❌ Failed to seed database:', err);
    process.exit(1);
  });
}
